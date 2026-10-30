import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  Award,
  Search,
  Calendar,
  Gift,
  FileText,
  Phone,
  Mail,
  ExternalLink,
  Briefcase,
  Users,
  ChevronRight,
  Clock,
  X
} from 'lucide-react';

export default function GymAdminShortlisted() {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [interviewForm, setInterviewForm] = useState({
    date: '',
    time: '',
    duration: '30 mins',
    mode: 'Online',
    locationOrLink: '',
    instructions: ''
  });

  const [offerForm, setOfferForm] = useState({
    offeredSalary: '',
    salaryPeriod: 'Month',
    employmentType: 'Full-time',
    joiningDate: '',
    terms: ''
  });

  useEffect(() => {
    fetchShortlisted();
  }, []);

  const fetchShortlisted = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5600/api/hiring/admin/applications', {
        headers: { Authorization: `Bearer ${token}` },
        params: { status: 'Shortlisted' }
      });
      if (res.data.success) {
        setCandidates(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load shortlisted:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        'http://localhost:5600/api/hiring/admin/interviews',
        {
          applicationId: selectedApp._id,
          ...interviewForm
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        alert('Interview scheduled and invite sent!');
        setShowInterviewModal(false);
        fetchShortlisted();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to schedule');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        'http://localhost:5600/api/hiring/admin/offers',
        {
          applicationId: selectedApp._id,
          ...offerForm
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        alert('Job offer sent successfully!');
        setShowOfferModal(false);
        fetchShortlisted();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to send offer');
    } finally {
      setActionLoading(false);
    }
  };

  const filtered = candidates.filter((c) => {
    const term = search.toLowerCase();
    return (
      c.fullName?.toLowerCase().includes(term) ||
      c.jobId?.title?.toLowerCase().includes(term) ||
      c.expertise?.some((e: string) => e.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#292524] flex items-center gap-2">
            <Award className="w-7 h-7 text-purple-400" />
            Shortlisted Candidates
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Top talent singled out for interviews, practical skill assessments, and final selection
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/admin/hiring/applications"
            className="px-4 py-2 bg-[#FFFFFF] hover:bg-[#F3E8E8] text-slate-300 rounded-xl border border-[#E7DADD] text-sm flex items-center gap-2"
          >
            <Users className="w-4 h-4 text-[#B76E79]" />
            All Applications
          </Link>
          <Link
            to="/admin/hiring/interviews"
            className="px-4 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-xl text-sm font-medium"
          >
            Interview Schedule
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="bg-[#F3E8E8] p-4 rounded-2xl border border-[#E7DADD]">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search shortlisted candidates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#FFFFFF] border border-[#E7DADD] rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-purple-400"
          />
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400 bg-[#F3E8E8] rounded-2xl border border-[#E7DADD]">
          <div className="inline-block animate-spin w-8 h-8 border-4 border-purple-400 border-t-transparent rounded-full mb-3" />
          <p>Loading shortlisted talent...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center bg-[#F3E8E8] rounded-2xl border border-[#E7DADD]">
          <Award className="w-12 h-12 text-purple-400/40 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-[#292524] mb-1">No shortlisted candidates yet</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto mb-4">
            Review incoming applications from the Applications tab and click "Shortlist" on candidates who match your qualifications.
          </p>
          <Link
            to="/admin/hiring/applications"
            className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 rounded-xl text-sm font-medium inline-block"
          >
            Review Applications
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((candidate) => (
            <div
              key={candidate._id}
              className="bg-[#F3E8E8] border border-purple-500/20 rounded-2xl p-5 hover:border-purple-500/40 transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="text-base font-bold text-[#292524]">{candidate.fullName}</h3>
                    <span className="text-xs text-purple-300 font-medium block">
                      {candidate.jobId?.title || 'Gym Trainer'}
                    </span>
                  </div>
                  <span className="text-[11px] bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-full border border-purple-500/30 font-medium">
                    Shortlisted
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-400 mt-3 bg-[#FFFFFF] p-3 rounded-xl border border-[#E7DADD]">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    <span className="truncate">{candidate.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    <span>{candidate.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-3.5 h-3.5 text-[#B76E79]" />
                    <span className="text-white font-medium">{candidate.yearsOfExperience} yrs exp</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-[#B76E79] font-mono">{candidate.expectedSalary || 'Negotiable'}</span>
                  </div>
                </div>

                <div className="mt-3">
                  <span className="text-[10px] text-slate-500 block uppercase font-semibold mb-1">
                    Expertise
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {candidate.expertise?.map((e: string, i: number) => (
                      <span
                        key={i}
                        className="text-[10px] bg-[#F3E8E8] text-slate-300 px-2 py-0.5 rounded border border-[#E7DADD]"
                      >
                        {e}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#E7DADD] flex flex-col gap-2">
                {candidate.resumeUrl && (
                  <a
                    href={`http://localhost:5600${candidate.resumeUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full text-center py-1.5 bg-[#FFFFFF] hover:bg-[#F3E8E8] text-slate-300 text-xs rounded-lg border border-[#E7DADD] transition-all flex items-center justify-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5 text-[#B76E79]" />
                    View Resume
                  </a>
                )}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setSelectedApp(candidate);
                      setShowInterviewModal(true);
                    }}
                    className="py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-xl text-xs font-medium flex items-center justify-center gap-1"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    Interview
                  </button>
                  <button
                    onClick={() => {
                      setSelectedApp(candidate);
                      setShowOfferModal(true);
                    }}
                    className="py-1.5 bg-[#B76E79] hover:bg-[#9F5965] text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1"
                  >
                    <Gift className="w-3.5 h-3.5" />
                    Job Offer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Schedule Interview Modal */}
      {showInterviewModal && selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#F3E8E8] border border-[#E7DADD] rounded-2xl max-w-md w-full p-6 text-white space-y-4">
            <div className="flex items-center justify-between border-b border-[#E7DADD] pb-3">
              <h3 className="font-bold text-base flex items-center gap-2 text-cyan-400">
                <Calendar className="w-5 h-5" />
                Schedule Interview: {selectedApp.fullName}
              </h3>
              <button
                onClick={() => setShowInterviewModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleScheduleInterview} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={interviewForm.date}
                    onChange={(e) => setInterviewForm({ ...interviewForm, date: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#E7DADD] rounded-xl text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Time *</label>
                  <input
                    type="time"
                    required
                    value={interviewForm.time}
                    onChange={(e) => setInterviewForm({ ...interviewForm, time: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#E7DADD] rounded-xl text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Mode *</label>
                  <select
                    value={interviewForm.mode}
                    onChange={(e) => setInterviewForm({ ...interviewForm, mode: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#E7DADD] rounded-xl text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="Online">Online (Google Meet / Zoom)</option>
                    <option value="In-Person">In-Person at Gym</option>
                    <option value="Phone">Phone Call</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Duration</label>
                  <input
                    type="text"
                    value={interviewForm.duration}
                    onChange={(e) =>
                      setInterviewForm({ ...interviewForm, duration: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#E7DADD] rounded-xl text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Meeting Link or Location *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. https://meet.google.com/xyz or Gym Floor 2"
                  value={interviewForm.locationOrLink}
                  onChange={(e) =>
                    setInterviewForm({ ...interviewForm, locationOrLink: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#E7DADD] rounded-xl text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Instructions for Trainer</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Please bring workout apparel for practical fitness demonstration"
                  value={interviewForm.instructions}
                  onChange={(e) =>
                    setInterviewForm({ ...interviewForm, instructions: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#E7DADD] rounded-xl text-white focus:outline-none focus:border-cyan-400 resize-none"
                />
              </div>

              <div className="pt-3 border-t border-[#E7DADD] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowInterviewModal(false)}
                  className="px-3 py-1.5 bg-[#FFFFFF] hover:bg-[#F3E8E8] text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold rounded-xl"
                >
                  Confirm & Notify
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Issue Job Offer Modal */}
      {showOfferModal && selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#F3E8E8] border border-[#E7DADD] rounded-2xl max-w-md w-full p-6 text-white space-y-4">
            <div className="flex items-center justify-between border-b border-[#E7DADD] pb-3">
              <h3 className="font-bold text-base flex items-center gap-2 text-[#B76E79]">
                <Gift className="w-5 h-5" />
                Issue Offer: {selectedApp.fullName}
              </h3>
              <button
                onClick={() => setShowOfferModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendOffer} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Offered Salary (₹) *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 45000"
                    value={offerForm.offeredSalary}
                    onChange={(e) =>
                      setOfferForm({ ...offerForm, offeredSalary: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#E7DADD] rounded-xl text-white focus:outline-none focus:border-[#B76E79]"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Salary Period</label>
                  <select
                    value={offerForm.salaryPeriod}
                    onChange={(e) =>
                      setOfferForm({ ...offerForm, salaryPeriod: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#E7DADD] rounded-xl text-white focus:outline-none focus:border-[#B76E79]"
                  >
                    <option value="Month">Per Month</option>
                    <option value="Year">Per Annum (LPA)</option>
                    <option value="Hour">Per Hour</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Employment Type</label>
                  <select
                    value={offerForm.employmentType}
                    onChange={(e) =>
                      setOfferForm({ ...offerForm, employmentType: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#E7DADD] rounded-xl text-white focus:outline-none focus:border-[#B76E79]"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Freelance">Freelance</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Target Joining Date *</label>
                  <input
                    type="date"
                    required
                    value={offerForm.joiningDate}
                    onChange={(e) =>
                      setOfferForm({ ...offerForm, joiningDate: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#E7DADD] rounded-xl text-white focus:outline-none focus:border-[#B76E79]"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Offer Terms / Perks</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Performance bonus, gym gear allowance."
                  value={offerForm.terms}
                  onChange={(e) => setOfferForm({ ...offerForm, terms: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#E7DADD] rounded-xl text-white focus:outline-none focus:border-[#B76E79] resize-none"
                />
              </div>

              <div className="pt-3 border-t border-[#E7DADD] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowOfferModal(false)}
                  className="px-3 py-1.5 bg-[#FFFFFF] hover:bg-[#F3E8E8] text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-1.5 bg-[#B76E79] hover:bg-[#9F5965] text-white font-semibold rounded-xl"
                >
                  Dispatch Job Offer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
