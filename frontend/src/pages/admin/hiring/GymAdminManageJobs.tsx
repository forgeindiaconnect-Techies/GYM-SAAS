import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../../utils/api';
import { 
  Briefcase, 
  Plus, 
  Search, 
  Filter, 
  Users, 
  Eye, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  MapPin, 
  IndianRupee, 
  Calendar,
  AlertCircle,
  ChevronRight,
  UserCheck,
  Award
} from 'lucide-react';

const GymAdminManageJobs: React.FC = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (searchTerm) params.search = searchTerm;
      const res = await api.get('/hiring/owner/jobs', { params });
      if (res.data.success) {
        setJobs(res.data.jobs || []);
      }
    } catch (err) {
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchJobs();
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    try {
      setActionLoading(id);
      const newStatus = currentStatus === 'Published' ? 'Closed' : 'Published';
      const res = await api.patch(`/hiring/owner/jobs/${id}/status`, { status: newStatus });
      if (res.data.success) {
        setJobs(prev => prev.map(j => j._id === id ? { ...j, status: newStatus } : j));
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update job status');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setActionLoading(id);
      const res = await api.delete(`/hiring/owner/jobs/${id}`);
      if (res.data.success) {
        setJobs(prev => prev.filter(j => j._id !== id));
        setDeleteConfirmId(null);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete job');
    } finally {
      setActionLoading(null);
    }
  };

  // Summary stats
  const totalJobs = jobs.length;
  const publishedCount = jobs.filter(j => j.status === 'Published').length;
  const totalApplicants = jobs.reduce((acc, j) => acc + (j.applicantsCount || 0), 0);
  const totalHired = jobs.reduce((acc, j) => acc + (j.hiredCount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#F5FAFA] tracking-tight flex items-center gap-2.5">
            <Briefcase className="text-[#2DD4BF]" size={26} />
            <span>Trainer Hiring & Vacancies</span>
          </h1>
          <p className="text-xs text-[#9AAEAE] mt-1">
            Create coaching vacancies, review trainer applications, and manage interview schedules.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/hiring/applications"
            className="px-4 py-2 bg-[#141D1E] hover:bg-[#1B2728] border border-[#2A3A3A] hover:border-[#2DD4BF]/50 text-xs font-bold text-[#F5FAFA] rounded-xl transition-all flex items-center gap-2 shadow-sm"
          >
            <Users size={15} className="text-[#2DD4BF]" />
            <span>All Applications ({totalApplicants})</span>
          </Link>
          <Link
            to="/admin/hiring/jobs/new"
            className="px-4 py-2 bg-[#2DD4BF] hover:bg-[#5EEAD4] text-[#06201D] text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-md shadow-teal-500/20"
          >
            <Plus size={16} />
            <span>Post a New Vacancy</span>
          </Link>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#141D1E] border border-[#2A3A3A] rounded-2xl p-4 shadow-lg flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[#2DD4BF]/10 border border-[#2DD4BF]/20 text-[#2DD4BF] flex items-center justify-center shrink-0">
            <Briefcase size={20} />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-[#9AAEAE] tracking-wider">Total Vacancies</p>
            <p className="text-xl font-black text-[#F5FAFA]">{totalJobs}</p>
          </div>
        </div>

        <div className="bg-[#141D1E] border border-[#2A3A3A] rounded-2xl p-4 shadow-lg flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-[#9AAEAE] tracking-wider">Active Published</p>
            <p className="text-xl font-black text-[#F5FAFA]">{publishedCount}</p>
          </div>
        </div>

        <div className="bg-[#141D1E] border border-[#2A3A3A] rounded-2xl p-4 shadow-lg flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
            <Users size={20} />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-[#9AAEAE] tracking-wider">Total Applicants</p>
            <p className="text-xl font-black text-[#F5FAFA]">{totalApplicants}</p>
          </div>
        </div>

        <div className="bg-[#141D1E] border border-[#2A3A3A] rounded-2xl p-4 shadow-lg flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <Award size={20} />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-[#9AAEAE] tracking-wider">Trainers Hired</p>
            <p className="text-xl font-black text-[#F5FAFA]">{totalHired}</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#141D1E] border border-[#2A3A3A] rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-md">
        <form onSubmit={handleSearch} className="flex-1 w-full flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9AAEAE]" size={16} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by vacancy title, expertise, or location..."
              className="w-full pl-10 pr-4 py-2 bg-[#0E1415] border border-[#2A3A3A] rounded-xl text-xs text-[#F5FAFA] placeholder:text-[#9AAEAE]/60 focus:outline-none focus:border-[#2DD4BF]"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-[#1B2728] hover:bg-[#2DD4BF] hover:text-[#06201D] text-xs font-bold text-[#F5FAFA] rounded-xl border border-[#2A3A3A] transition-all"
          >
            Search
          </button>
        </form>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          {['all', 'Published', 'Draft', 'Closed'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-[#2DD4BF] text-[#06201D] shadow-sm'
                  : 'bg-[#0E1415] text-[#9AAEAE] hover:text-[#F5FAFA] border border-[#2A3A3A]'
              }`}
            >
              {st === 'all' ? 'All Status' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Vacancies List */}
      {loading ? (
        <div className="bg-[#141D1E] border border-[#2A3A3A] rounded-3xl p-12 text-center text-sm text-[#9AAEAE] flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-2 border-[#2DD4BF] border-t-transparent rounded-full animate-spin" />
          <span>Loading vacancies...</span>
        </div>
      ) : jobs.length === 0 ? (
        <div className="bg-[#141D1E] border border-[#2A3A3A] rounded-3xl p-12 text-center text-[#9AAEAE]">
          <Briefcase className="mx-auto mb-3 text-[#2DD4BF]/40" size={42} />
          <h3 className="text-lg font-bold text-[#F5FAFA] mb-1">No vacancies found</h3>
          <p className="text-xs text-[#9AAEAE] max-w-sm mx-auto mb-6">
            {searchTerm || statusFilter !== 'all' 
              ? 'No job vacancies match your selected filters. Try resetting search.' 
              : 'You have not posted any trainer vacancies yet. Create your first opening to attract certified coaches.'}
          </p>
          <Link
            to="/admin/hiring/jobs/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#2DD4BF] text-[#06201D] text-xs font-bold rounded-xl hover:bg-[#5EEAD4] transition-all shadow-md shadow-teal-500/20"
          >
            <Plus size={16} />
            <span>Post a Vacancy Now</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div
              key={job._id}
              className="bg-[#141D1E] border border-[#2A3A3A] hover:border-[#2DD4BF]/40 rounded-2xl p-5 sm:p-6 transition-all shadow-md group"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Left Info */}
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      job.status === 'Published' 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                        : job.status === 'Draft' 
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' 
                        : 'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}>
                      {job.status}
                    </span>
                    <span className="text-[11px] text-[#9AAEAE] flex items-center gap-1 font-semibold">
                      <Clock size={12} /> {job.employmentType}
                    </span>
                    <span className="text-[11px] text-[#9AAEAE] flex items-center gap-1">
                      <MapPin size={12} className="text-[#2DD4BF]" /> {job.location}
                    </span>
                    {job.vacanciesCount > 1 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#0E1415] text-[#2DD4BF] border border-[#2A3A3A]">
                        {job.vacanciesCount} Openings
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-[#F5FAFA] group-hover:text-[#2DD4BF] transition-colors">
                    {job.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#9AAEAE]">
                    <span className="flex items-center gap-1 font-semibold text-[#F5FAFA]">
                      <IndianRupee size={13} className="text-[#2DD4BF]" />
                      {job.salaryMin && job.salaryMax 
                        ? `₹${job.salaryMin.toLocaleString()} - ₹${job.salaryMax.toLocaleString()} / ${job.salaryType}` 
                        : (job.salaryMin ? `From ₹${job.salaryMin.toLocaleString()}` : 'Competitive / Negotiable')}
                    </span>
                    <span>• Experience: {job.experience}</span>
                    {job.deadline && (
                      <span className="flex items-center gap-1">
                        • Deadline: {new Date(job.deadline).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  {job.expertise && job.expertise.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {job.expertise.map((exp: string, idx: number) => (
                        <span key={idx} className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#0E1415] text-[#9AAEAE] border border-[#2A3A3A]">
                          {exp}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right Applicant Stats & Action Buttons */}
                <div className="flex flex-wrap lg:flex-col items-end justify-between gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-[#2A3A3A]">
                  <div className="flex items-center gap-4 text-center">
                    <Link
                      to={`/admin/hiring/applications?jobId=${job._id}`}
                      className="bg-[#0E1415] border border-[#2A3A3A] hover:border-[#2DD4BF]/50 rounded-xl px-3.5 py-1.5 transition-all text-center group/app"
                    >
                      <div className="text-base font-black text-[#2DD4BF] group-hover/app:scale-105 transition-transform">
                        {job.applicantsCount || 0}
                      </div>
                      <div className="text-[10px] font-bold text-[#9AAEAE] uppercase">Applicants</div>
                    </Link>

                    <div className="bg-[#0E1415] border border-[#2A3A3A] rounded-xl px-3.5 py-1.5 text-center">
                      <div className="text-base font-black text-amber-400">
                        {job.shortlistedCount || 0}
                      </div>
                      <div className="text-[10px] font-bold text-[#9AAEAE] uppercase">Shortlisted</div>
                    </div>

                    <div className="bg-[#0E1415] border border-[#2A3A3A] rounded-xl px-3.5 py-1.5 text-center">
                      <div className="text-base font-black text-emerald-400">
                        {job.hiredCount || 0}
                      </div>
                      <div className="text-[10px] font-bold text-[#9AAEAE] uppercase">Hired</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleStatus(job._id, job.status)}
                      disabled={actionLoading === job._id}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                        job.status === 'Published'
                          ? 'bg-[#1B2728] text-red-400 border-red-500/20 hover:bg-red-500/10'
                          : 'bg-[#1B2728] text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/10'
                      }`}
                    >
                      {job.status === 'Published' ? 'Close Job' : 'Publish Job'}
                    </button>

                    <Link
                      to={`/admin/hiring/jobs/edit/${job._id}`}
                      className="p-2 bg-[#1B2728] hover:bg-[#2A3A3A] text-[#F5FAFA] rounded-xl border border-[#2A3A3A] transition-all"
                      title="Edit Job"
                    >
                      <Edit3 size={15} />
                    </Link>

                    {deleteConfirmId === job._id ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleDelete(job._id)}
                          className="px-2.5 py-1.5 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-2.5 py-1.5 bg-[#1B2728] text-[#9AAEAE] rounded-xl text-xs"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirmId(job._id)}
                        className="p-2 bg-[#1B2728] hover:bg-red-500/20 text-[#9AAEAE] hover:text-red-400 rounded-xl border border-[#2A3A3A] transition-all"
                        title="Delete Vacancy"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
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

export default GymAdminManageJobs;
