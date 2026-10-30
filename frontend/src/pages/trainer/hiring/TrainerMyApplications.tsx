import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  Building2,
  MapPin,
  Clock,
  Calendar,
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle,
  Search,
  ExternalLink,
  ChevronRight,
  RotateCcw,
  Eye,
  X,
  Award,
  DollarSign,
  UserCheck
} from 'lucide-react';
import api from '../../../utils/api';

export default function TrainerMyApplications() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedApp, setSelectedApp] = useState<any | null>(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/hiring/trainer/applications');
      if (res.data.success) {
        setApplications(res.data.applications || res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (appId: string) => {
    if (!window.confirm('Are you sure you want to withdraw this job application?')) return;
    setActionLoading(true);
    try {
      const res = await api.patch(`/hiring/trainer/applications/${appId}/withdraw`);
      if (res.data.success) {
        alert('Application withdrawn successfully.');
        setApplications((prev) =>
          prev.map((a) => (a._id === appId ? { ...a, status: 'Withdrawn' } : a))
        );
        if (selectedApp?._id === appId) {
          setSelectedApp((prev: any) => ({ ...prev, status: 'Withdrawn' }));
        }
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to withdraw application');
    } finally {
      setActionLoading(false);
    }
  };

  // Status mapping as requested in prompt:
  // - Pending Review
  // - Under Review
  // - Shortlisted
  // - Interview Scheduled
  // - Approved
  // - Rejected
  // - Withdrawn
  const formatStatusDisplay = (status: string) => {
    switch (status) {
      case 'Applied':
        return 'Pending Review';
      case 'Selected':
      case 'Offer Accepted':
        return 'Approved';
      case 'Offer Rejected':
        return 'Offer Declined';
      default:
        return status;
    }
  };

  const getStatusBadge = (status: string) => {
    const formatted = formatStatusDisplay(status);
    switch (formatted) {
      case 'Pending Review':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'Under Review':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'Shortlisted':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'Interview Scheduled':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
      case 'Approved':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Rejected':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'Withdrawn':
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  const filtered = applications.filter((app) => {
    const term = search.toLowerCase();
    const title = app.jobId?.title || '';
    const gym = app.jobId?.gymName || app.gymId?.name || '';
    const status = formatStatusDisplay(app.status || '');
    return (
      title.toLowerCase().includes(term) ||
      gym.toLowerCase().includes(term) ||
      status.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#292524] flex items-center gap-2">
            <Briefcase className="w-7 h-7 text-[#B76E79]" />
            My Job Applications
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Track your application status, interview schedules, and gym hiring decisions in real-time
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/trainer/jobs"
            className="px-4 py-2 bg-[#B76E79] hover:bg-[#9F5965] text-white font-semibold rounded-xl text-sm transition-all shadow-md shadow-[#B76E79]/20"
          >
            Explore Open Vacancies
          </Link>
          <Link
            to="/trainer/job-offers"
            className="px-4 py-2 bg-[#FFFFFF] hover:bg-[#F3E8E8] text-slate-300 rounded-xl border border-[#E7DADD] text-sm"
          >
            View Job Offers
          </Link>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-[#F3E8E8] p-4 rounded-2xl border border-[#E7DADD]">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search applications by position, gym name, or status..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#FFFFFF] border border-[#E7DADD] rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#B76E79]"
          />
        </div>
      </div>

      {/* Applications List */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 bg-[#F3E8E8] rounded-2xl border border-[#E7DADD]">
          <div className="inline-block animate-spin w-8 h-8 border-4 border-[#B76E79] border-t-transparent rounded-full mb-3" />
          <p>Loading your job applications...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center bg-[#F3E8E8] rounded-2xl border border-[#E7DADD]">
          <Briefcase className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-[#292524] mb-1">No applications submitted yet</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto mb-4">
            Discover verified gym coach openings matching your fitness credentials and apply now.
          </p>
          <Link
            to="/trainer/jobs"
            className="px-4 py-2 bg-[#B76E79] text-white font-semibold rounded-xl text-xs inline-block shadow-md shadow-[#B76E79]/20"
          >
            Browse Vacancies
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((app) => {
            const job = app.jobId;
            const canWithdraw = ['Applied', 'Pending Review', 'Under Review', 'Shortlisted'].includes(app.status);
            const statusLabel = formatStatusDisplay(app.status);

            return (
              <div
                key={app._id}
                className="bg-[#F3E8E8] border border-[#E7DADD] rounded-2xl p-5 hover:border-[#B76E79]/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-bold text-[#292524]">{job?.title || 'Fitness Coach'}</h3>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full border font-bold ${getStatusBadge(
                        app.status
                      )}`}
                    >
                      {statusLabel}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1.5 text-white font-medium">
                      <Building2 className="w-3.5 h-3.5 text-[#B76E79]" />
                      {job?.gymName || app.gymId?.name || 'Verified Gym'}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      {job?.location || app.gymId?.address || 'On-site'}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      Applied on {new Date(app.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    {app.resumeUrl && (
                      <a
                        href={`http://localhost:5600${app.resumeUrl}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-[#B76E79] hover:text-[#9F5965] flex items-center gap-1 font-medium"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Submitted Resume <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => setSelectedApp(app)}
                      className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-medium"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#B76E79]" />
                      View Application Details
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 self-end md:self-center">
                  {app.status === 'Interview Scheduled' && (
                    <Link
                      to="/trainer/interviews"
                      className="px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-xl text-xs font-medium flex items-center gap-1"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      View Interview
                    </Link>
                  )}

                  {(app.status === 'Selected' || app.status === 'Offer Accepted') && (
                    <Link
                      to="/trainer/job-offers"
                      className="px-3.5 py-1.5 bg-[#B76E79] hover:bg-[#9F5965] text-white font-semibold rounded-xl text-xs"
                    >
                      Review Offer
                    </Link>
                  )}

                  <button
                    type="button"
                    onClick={() => setSelectedApp(app)}
                    className="px-3 py-1.5 bg-[#FFFFFF] hover:bg-[#F3E8E8] text-slate-300 hover:text-white border border-[#E7DADD] rounded-xl text-xs flex items-center gap-1"
                  >
                    <Eye size={13} />
                    Details
                  </button>

                  {canWithdraw && (
                    <button
                      disabled={actionLoading}
                      onClick={() => handleWithdraw(app._id)}
                      className="px-3 py-1.5 bg-[#FFFFFF] hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 border border-[#E7DADD] hover:border-rose-500/30 rounded-xl text-xs transition-all flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Withdraw
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW APPLICATION DETAILS MODAL */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#F3E8E8] border border-[#E7DADD] rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-start justify-between pb-4 border-b border-[#E7DADD]">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#B76E79] tracking-wider block">
                  Application Details
                </span>
                <h2 className="text-xl font-bold text-[#292524] mt-0.5">
                  {selectedApp.jobId?.title || 'Fitness Coach'}
                </h2>
                <p className="text-xs text-slate-400">
                  at {selectedApp.jobId?.gymName || selectedApp.gymId?.name || 'Verified Gym'} · Applied {new Date(selectedApp.createdAt).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="p-2 rounded-xl bg-[#FFFFFF] text-slate-400 hover:text-white border border-[#E7DADD]"
              >
                <X size={18} />
              </button>
            </div>

            {/* Current Status Banner */}
            <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#E7DADD] flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block">Application Status</span>
                <span className={`inline-block mt-1 text-xs px-3 py-1 rounded-full border font-bold ${getStatusBadge(selectedApp.status)}`}>
                  {formatStatusDisplay(selectedApp.status)}
                </span>
              </div>
              {selectedApp.reviewNotes && (
                <div className="text-right text-xs max-w-xs">
                  <span className="text-slate-400 block">Notes from Gym</span>
                  <span className="text-white italic">{selectedApp.reviewNotes}</span>
                </div>
              )}
            </div>

            {/* Candidate & Application Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-[#FFFFFF] border border-[#E7DADD] space-y-1">
                <span className="text-slate-500 font-semibold uppercase text-[10px]">Candidate Name</span>
                <p className="font-bold text-white">{selectedApp.name}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#FFFFFF] border border-[#E7DADD] space-y-1">
                <span className="text-slate-500 font-semibold uppercase text-[10px]">Contact Info</span>
                <p className="text-slate-300">{selectedApp.email} · {selectedApp.phone}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#FFFFFF] border border-[#E7DADD] space-y-1">
                <span className="text-slate-500 font-semibold uppercase text-[10px]">Work Experience</span>
                <p className="font-bold text-white">{selectedApp.workExperience || '1-2 Years'}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#FFFFFF] border border-[#E7DADD] space-y-1">
                <span className="text-slate-500 font-semibold uppercase text-[10px]">Availability</span>
                <p className="font-bold text-white">{selectedApp.availability || 'Immediately'}</p>
              </div>

              {selectedApp.expectedSalary && (
                <div className="p-3.5 rounded-xl bg-[#FFFFFF] border border-[#E7DADD] space-y-1">
                  <span className="text-slate-500 font-semibold uppercase text-[10px]">Expected Salary</span>
                  <p className="font-bold text-[#B76E79]">₹{selectedApp.expectedSalary}</p>
                </div>
              )}

              {selectedApp.preferredLocation && (
                <div className="p-3.5 rounded-xl bg-[#FFFFFF] border border-[#E7DADD] space-y-1">
                  <span className="text-slate-500 font-semibold uppercase text-[10px]">Preferred Location</span>
                  <p className="font-bold text-white">{selectedApp.preferredLocation}</p>
                </div>
              )}
            </div>

            {/* Qualifications & Certifications */}
            {(selectedApp.qualifications || selectedApp.certifications) && (
              <div className="space-y-3 p-4 rounded-2xl bg-[#FFFFFF] border border-[#E7DADD] text-xs">
                {selectedApp.qualifications && (
                  <div>
                    <span className="text-slate-500 font-semibold uppercase text-[10px] block">Qualifications</span>
                    <p className="text-slate-300 mt-0.5">{selectedApp.qualifications}</p>
                  </div>
                )}
                {selectedApp.certifications && (
                  <div>
                    <span className="text-slate-500 font-semibold uppercase text-[10px] block">Certifications</span>
                    <p className="text-slate-300 mt-0.5">{selectedApp.certifications}</p>
                  </div>
                )}
              </div>
            )}

            {/* Resume Document Link */}
            {selectedApp.resumeUrl && (
              <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#B76E79]/30 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#B76E79]/10 text-[#B76E79] flex items-center justify-center">
                    <FileText size={18} />
                  </div>
                  <div>
                    <span className="font-bold text-white block">Submitted Resume Document</span>
                    <span className="text-[11px] text-slate-400">PDF / Word Document</span>
                  </div>
                </div>

                <a
                  href={`http://localhost:5600${selectedApp.resumeUrl}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-[#B76E79] hover:bg-[#9F5965] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shadow-[#B76E79]/15"
                >
                  <span>Open Resume</span>
                  <ExternalLink size={13} />
                </a>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                className="px-5 py-2.5 bg-[#FFFFFF] hover:bg-[#F3E8E8] border border-[#E7DADD] text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
