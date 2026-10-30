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

  const isDeadlineCompleted = (deadline?: string) => {
    if (!deadline) return false;
    const d = new Date(deadline);
    d.setHours(23, 59, 59, 999);
    return d.getTime() < Date.now();
  };

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
          <h1 className="text-2xl font-black text-[#292524] tracking-tight flex items-center gap-2.5">
            <Briefcase className="text-[#B76E79]" size={26} />
            <span>Trainer Hiring & Vacancies</span>
          </h1>
          <p className="text-xs text-[#57534E] mt-1">
            Create coaching vacancies, review trainer applications, and manage interview schedules.
          </p>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#FFFFFF] border border-[#E7DADD] rounded-2xl p-4 shadow-lg flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[#B76E79]/10 border border-[#B76E79]/20 text-[#B76E79] flex items-center justify-center shrink-0">
            <Briefcase size={20} />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-[#57534E] tracking-wider">Total Vacancies</p>
            <p className="text-xl font-black text-[#292524]">{totalJobs}</p>
          </div>
        </div>

        <div className="bg-[#FFFFFF] border border-[#E7DADD] rounded-2xl p-4 shadow-lg flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-[#57534E] tracking-wider">Active Published</p>
            <p className="text-xl font-black text-[#292524]">{publishedCount}</p>
          </div>
        </div>

        <div className="bg-[#FFFFFF] border border-[#E7DADD] rounded-2xl p-4 shadow-lg flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
            <Users size={20} />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-[#57534E] tracking-wider">Total Applicants</p>
            <p className="text-xl font-black text-[#292524]">{totalApplicants}</p>
          </div>
        </div>

        <div className="bg-[#FFFFFF] border border-[#E7DADD] rounded-2xl p-4 shadow-lg flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <Award size={20} />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-[#57534E] tracking-wider">Trainers Hired</p>
            <p className="text-xl font-black text-[#292524]">{totalHired}</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#FFFFFF] border border-[#E7DADD] rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-md">
        <form onSubmit={handleSearch} className="flex-1 w-full flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#57534E]" size={16} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by vacancy title, expertise, or location..."
              className="w-full pl-10 pr-4 py-2 bg-[#F3E8E8] border border-[#E7DADD] rounded-xl text-xs text-[#292524] placeholder:text-[#57534E]/60 focus:outline-none focus:border-[#B76E79]"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-[#F3E8E8] hover:bg-[#B76E79] hover:text-[#FFFFFF] text-xs font-bold text-[#292524] rounded-xl border border-[#E7DADD] transition-all"
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
                  ? 'bg-[#B76E79] text-white shadow-sm'
                  : 'bg-[#F3E8E8] text-[#57534E] hover:text-[#292524] border border-[#E7DADD]'
              }`}
            >
              {st === 'all' ? 'All Status' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Vacancies List */}
      {loading ? (
        <div className="bg-[#FFFFFF] border border-[#E7DADD] rounded-3xl p-12 text-center text-sm text-[#57534E] flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-2 border-[#B76E79] border-t-transparent rounded-full animate-spin" />
          <span>Loading vacancies...</span>
        </div>
      ) : jobs.length === 0 ? (
        <div className="bg-[#FFFFFF] border border-[#E7DADD] rounded-3xl p-12 text-center text-[#57534E]">
          <Briefcase className="mx-auto mb-3 text-[#B76E79]/40" size={42} />
          <h3 className="text-lg font-bold text-[#292524] mb-1">No vacancies found</h3>
          <p className="text-xs text-[#57534E] max-w-sm mx-auto mb-6">
            {searchTerm || statusFilter !== 'all' 
              ? 'No job vacancies match your selected filters. Try resetting search.' 
              : 'You have not posted any trainer vacancies yet. Create your first opening to attract certified coaches.'}
          </p>
          <Link
            to="/admin/hiring/jobs/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#B76E79] text-white text-xs font-bold rounded-xl hover:bg-[#9F5965] transition-all shadow-md shadow-[#B76E79]/20"
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
              className="bg-[#FFFFFF] border border-[#E7DADD] hover:border-[#B76E79]/40 rounded-2xl p-5 sm:p-6 transition-all shadow-md group"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Left Info */}
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {isDeadlineCompleted(job.deadline) ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold border bg-red-500/15 text-red-400 border-red-500/30 flex items-center gap-1">
                        <AlertCircle size={11} /> Job Vacancy Over
                      </span>
                    ) : (
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        job.status === 'Published' 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                          : job.status === 'Draft' 
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' 
                          : 'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}>
                        {job.status}
                      </span>
                    )}
                    <span className="text-[11px] text-[#57534E] flex items-center gap-1 font-semibold">
                      <Clock size={12} /> {job.employmentType}
                    </span>
                    <span className="text-[11px] text-[#57534E] flex items-center gap-1">
                      <MapPin size={12} className="text-[#B76E79]" /> {job.location}
                    </span>
                    {job.vacanciesCount > 1 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#F3E8E8] text-[#B76E79] border border-[#E7DADD]">
                        {job.vacanciesCount} Openings
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-[#292524] group-hover:text-[#B76E79] transition-colors">
                    {job.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#57534E]">
                    <span className="flex items-center gap-1 font-semibold text-[#292524]">
                      <IndianRupee size={13} className="text-[#B76E79]" />
                      {job.salaryMin && job.salaryMax 
                        ? `₹${job.salaryMin.toLocaleString()} - ₹${job.salaryMax.toLocaleString()} / ${job.salaryType}` 
                        : (job.salaryMin ? `From ₹${job.salaryMin.toLocaleString()}` : 'Competitive / Negotiable')}
                    </span>
                    <span>• Experience: {job.experience}</span>
                    {job.deadline && (
                      <span className={`flex items-center gap-1 font-semibold ${isDeadlineCompleted(job.deadline) ? 'text-red-400' : ''}`}>
                        • Deadline: {new Date(job.deadline).toLocaleDateString()}
                        {isDeadlineCompleted(job.deadline) && ' (Job Vacancy Over)'}
                      </span>
                    )}
                  </div>

                  {job.expertise && job.expertise.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {job.expertise.map((exp: string, idx: number) => (
                        <span key={idx} className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#F3E8E8] text-[#57534E] border border-[#E7DADD]">
                          {exp}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right Applicant Stats & Action Buttons */}
                <div className="flex flex-wrap lg:flex-col items-end justify-between gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-[#E7DADD]">
                  <div className="flex items-center gap-4 text-center">
                    <Link
                      to={`/admin/hiring/applications?jobId=${job._id}`}
                      className="bg-[#F3E8E8] border border-[#E7DADD] hover:border-[#B76E79]/50 rounded-xl px-3.5 py-1.5 transition-all text-center group/app"
                    >
                      <div className="text-base font-black text-[#B76E79] group-hover/app:scale-105 transition-transform">
                        {job.applicantsCount || 0}
                      </div>
                      <div className="text-[10px] font-bold text-[#57534E] uppercase">Applicants</div>
                    </Link>

                    <div className="bg-[#F3E8E8] border border-[#E7DADD] rounded-xl px-3.5 py-1.5 text-center">
                      <div className="text-base font-black text-amber-400">
                        {job.shortlistedCount || 0}
                      </div>
                      <div className="text-[10px] font-bold text-[#57534E] uppercase">Shortlisted</div>
                    </div>

                    <div className="bg-[#F3E8E8] border border-[#E7DADD] rounded-xl px-3.5 py-1.5 text-center">
                      <div className="text-base font-black text-emerald-400">
                        {job.hiredCount || 0}
                      </div>
                      <div className="text-[10px] font-bold text-[#57534E] uppercase">Hired</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleStatus(job._id, job.status)}
                      disabled={actionLoading === job._id}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                        job.status === 'Published'
                          ? 'bg-[#F3E8E8] text-red-400 border-red-500/20 hover:bg-red-500/10'
                          : 'bg-[#F3E8E8] text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/10'
                      }`}
                    >
                      {job.status === 'Published' ? 'Close Job' : 'Publish Job'}
                    </button>

                    <Link
                      to={`/admin/hiring/jobs/edit/${job._id}`}
                      className="p-2 bg-[#F3E8E8] hover:bg-[#E7DADD] text-[#292524] rounded-xl border border-[#E7DADD] transition-all"
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
                          className="px-2.5 py-1.5 bg-[#F3E8E8] text-[#57534E] rounded-xl text-xs"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirmId(job._id)}
                        className="p-2 bg-[#F3E8E8] hover:bg-red-500/20 text-[#57534E] hover:text-red-400 rounded-xl border border-[#E7DADD] transition-all"
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
