import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  Calendar,
  Clock,
  Video,
  MapPin,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  AlertCircle,
  ExternalLink,
  Users,
  Search,
  Filter
} from 'lucide-react';

export default function GymAdminInterviews() {
  const [interviews, setInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchInterviews();
  }, [statusFilter]);

  const fetchInterviews = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params: any = {};
      if (statusFilter) params.status = statusFilter;
      const res = await axios.get('http://localhost:5600/api/hiring/admin/interviews', {
        headers: { Authorization: `Bearer ${token}` },
        params
      });
      if (res.data.success) {
        setInterviews(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load interviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (interviewId: string, newStatus: string) => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.patch(
        `http://localhost:5600/api/hiring/admin/interviews/${interviewId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setInterviews((prev) =>
          prev.map((i) => (i._id === interviewId ? { ...i, status: newStatus } : i))
        );
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update interview');
    } finally {
      setActionLoading(false);
    }
  };

  const filtered = interviews.filter((i) => {
    const term = search.toLowerCase();
    return (
      i.trainerId?.name?.toLowerCase().includes(term) ||
      i.applicationId?.fullName?.toLowerCase().includes(term) ||
      i.jobId?.title?.toLowerCase().includes(term)
    );
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Scheduled':
        return 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30';
      case 'Completed':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'Cancelled':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'Rescheduled':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Calendar className="w-7 h-7 text-cyan-400" />
            Interview Schedule
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Conduct trainer screening, technical trials, and practical workout assessments
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/admin/hiring/applications"
            className="px-4 py-2 bg-[#141D1E] hover:bg-[#1B2728] text-slate-300 rounded-xl border border-[#2A3A3A] text-sm flex items-center gap-2"
          >
            <Users className="w-4 h-4 text-[#2DD4BF]" />
            Applications
          </Link>
          <Link
            to="/admin/hiring/hired"
            className="px-4 py-2 bg-[#2DD4BF]/10 hover:bg-[#2DD4BF]/20 text-[#2DD4BF] border border-[#2DD4BF]/30 rounded-xl text-sm font-medium"
          >
            Hired Trainers
          </Link>
        </div>
      </div>

      {/* Filter / Search */}
      <div className="bg-[#0E1415] p-4 rounded-2xl border border-[#2A3A3A] flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search interviews by candidate name or job title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#141D1E] border border-[#2A3A3A] rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-[#141D1E] border border-[#2A3A3A] rounded-xl text-slate-300 text-sm focus:outline-none focus:border-cyan-400 w-full md:w-auto"
        >
          <option value="">All Statuses</option>
          <option value="Scheduled">Scheduled</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
          <option value="Rescheduled">Rescheduled</option>
        </select>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400 bg-[#0E1415] rounded-2xl border border-[#2A3A3A]">
          <div className="inline-block animate-spin w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full mb-3" />
          <p>Loading interview schedule...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center bg-[#0E1415] rounded-2xl border border-[#2A3A3A]">
          <Calendar className="w-12 h-12 text-cyan-500/30 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-white mb-1">No interviews found</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            {search || statusFilter
              ? 'No interviews match your filters.'
              : 'You have not scheduled any trainer interviews yet. Shortlist a candidate and click "Schedule Interview".'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((inv) => {
            const candidateName = inv.applicationId?.fullName || inv.trainerId?.name || 'Candidate';
            const candidateEmail = inv.applicationId?.email || inv.trainerId?.email;
            const candidatePhone = inv.applicationId?.phone;

            return (
              <div
                key={inv._id}
                className="bg-[#0E1415] border border-[#2A3A3A] rounded-2xl p-5 hover:border-cyan-500/40 transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <h3 className="text-base font-bold text-white">{candidateName}</h3>
                      <span className="text-xs text-[#2DD4BF] font-medium block">
                        {inv.jobId?.title || 'Gym Trainer Position'}
                      </span>
                    </div>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${getStatusBadge(
                        inv.status
                      )}`}
                    >
                      {inv.status}
                    </span>
                  </div>

                  <div className="bg-[#141D1E] p-3 rounded-xl border border-[#2A3A3A] space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-slate-300">
                      <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="font-semibold text-white">
                        {new Date(inv.date).toLocaleDateString(undefined, {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{inv.time}</span>
                      <span className="text-slate-600">•</span>
                      <span>{inv.duration}</span>
                      <span className="text-slate-600">•</span>
                      <span className="text-cyan-300 font-medium">{inv.mode}</span>
                    </div>
                  </div>

                  {/* Location or Meeting Link */}
                  <div className="mt-3 text-xs bg-[#1B2728] p-3 rounded-xl border border-[#2A3A3A]">
                    <span className="text-slate-500 block uppercase font-semibold text-[10px] mb-1">
                      Venue / Link
                    </span>
                    {inv.locationOrLink?.startsWith('http') ? (
                      <a
                        href={inv.locationOrLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-cyan-400 hover:text-cyan-300 font-mono text-xs flex items-center gap-1.5 break-all"
                      >
                        <Video className="w-3.5 h-3.5 shrink-0" />
                        Join Meeting Link <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    ) : (
                      <div className="text-slate-200 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span>{inv.locationOrLink || 'Gym premises'}</span>
                      </div>
                    )}
                  </div>

                  {inv.instructions && (
                    <div className="mt-3 text-xs text-slate-400 italic bg-[#141D1E] p-2.5 rounded-lg border border-[#2A3A3A]">
                      "{inv.instructions}"
                    </div>
                  )}

                  <div className="mt-3 text-[11px] text-slate-500 flex items-center justify-between">
                    <span>{candidateEmail}</span>
                    {candidatePhone && <span>{candidatePhone}</span>}
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-[#2A3A3A] flex items-center justify-end gap-2">
                  {inv.status === 'Scheduled' && (
                    <>
                      <button
                        disabled={actionLoading}
                        onClick={() => handleUpdateStatus(inv._id, 'Completed')}
                        className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-medium flex items-center gap-1"
                      >
                        <CheckCircle className="w-3 h-3" />
                        Mark Done
                      </button>
                      <button
                        disabled={actionLoading}
                        onClick={() => handleUpdateStatus(inv._id, 'Cancelled')}
                        className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl text-xs font-medium flex items-center gap-1"
                      >
                        <XCircle className="w-3 h-3" />
                        Cancel
                      </button>
                    </>
                  )}
                  {inv.status === 'Completed' && (
                    <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> Assessment Finished
                    </span>
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
