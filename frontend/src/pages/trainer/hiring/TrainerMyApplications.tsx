import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
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
  RotateCcw
} from 'lucide-react';

export default function TrainerMyApplications() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5600/api/hiring/trainer/applications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setApplications(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (appId: string) => {
    if (!window.confirm('Are you sure you want to withdraw this application?')) return;
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.patch(
        `http://localhost:5600/api/hiring/trainer/applications/${appId}/withdraw`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        alert('Application withdrawn.');
        setApplications((prev) =>
          prev.map((a) => (a._id === appId ? { ...a, status: 'Withdrawn' } : a))
        );
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to withdraw application');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Applied':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'Under Review':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'Shortlisted':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'Interview Scheduled':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
      case 'Selected':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Offer Accepted':
        return 'bg-teal-500/10 text-teal-300 border-teal-500/30';
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
    return (
      app.jobId?.title?.toLowerCase().includes(term) ||
      app.jobId?.gymName?.toLowerCase().includes(term) ||
      app.status?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Briefcase className="w-7 h-7 text-[#2DD4BF]" />
            My Job Applications
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Track your application status, interview schedules, and gym job decisions in real-time
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/trainer/jobs"
            className="px-4 py-2 bg-[#2DD4BF] hover:bg-[#5EEAD4] text-black font-semibold rounded-xl text-sm transition-all"
          >
            Explore Open Vacancies
          </Link>
          <Link
            to="/trainer/job-offers"
            className="px-4 py-2 bg-[#141D1E] hover:bg-[#1B2728] text-slate-300 rounded-xl border border-[#2A3A3A] text-sm"
          >
            View Job Offers
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="bg-[#0E1415] p-4 rounded-2xl border border-[#2A3A3A]">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search applications by gym or position..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#141D1E] border border-[#2A3A3A] rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#2DD4BF]"
          />
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400 bg-[#0E1415] rounded-2xl border border-[#2A3A3A]">
          <div className="inline-block animate-spin w-8 h-8 border-4 border-[#2DD4BF] border-t-transparent rounded-full mb-3" />
          <p>Loading your job applications...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center bg-[#0E1415] rounded-2xl border border-[#2A3A3A]">
          <Briefcase className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-white mb-1">No applications submitted yet</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto mb-4">
            Discover active trainer openings matching your fitness credentials and kickstart your coaching career.
          </p>
          <Link
            to="/trainer/jobs"
            className="px-4 py-2 bg-[#2DD4BF] text-black font-semibold rounded-xl text-xs inline-block"
          >
            Browse Jobs Now
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((app) => {
            const job = app.jobId;
            const canWithdraw = ['Applied', 'Under Review', 'Shortlisted'].includes(app.status);

            return (
              <div
                key={app._id}
                className="bg-[#0E1415] border border-[#2A3A3A] rounded-2xl p-5 hover:border-[#2DD4BF]/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-bold text-white">{job?.title || 'Gym Trainer'}</h3>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${getStatusBadge(
                        app.status
                      )}`}
                    >
                      {app.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1.5 text-white font-medium">
                      <Building2 className="w-3.5 h-3.5 text-[#2DD4BF]" />
                      {job?.gymName || 'Fitness Club'}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      {job?.location}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      Applied on {new Date(app.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    {app.resumeUrl && (
                      <a
                        href={`http://localhost:5600${app.resumeUrl}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-[#2DD4BF] hover:text-[#5EEAD4] flex items-center gap-1 font-medium"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Submitted Resume <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Status Timeline / Actions */}
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

                  {app.status === 'Selected' && (
                    <Link
                      to="/trainer/job-offers"
                      className="px-3 py-1.5 bg-[#2DD4BF] hover:bg-[#5EEAD4] text-black font-semibold rounded-xl text-xs"
                    >
                      Review Offer
                    </Link>
                  )}

                  {canWithdraw && (
                    <button
                      disabled={actionLoading}
                      onClick={() => handleWithdraw(app._id)}
                      className="px-3 py-1.5 bg-[#141D1E] hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 border border-[#2A3A3A] hover:border-rose-500/30 rounded-xl text-xs transition-all flex items-center gap-1"
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
    </div>
  );
}
