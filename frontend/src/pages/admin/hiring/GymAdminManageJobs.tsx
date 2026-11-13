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
  Award,
  X,
  Save,
  Loader2,
  Building2
} from 'lucide-react';

const COMMON_EXPERTISE = [
  'Strength & Conditioning',
  'Functional Training',
  'Bodybuilding',
  'CrossFit',
  'HIIT & Cardio',
  'Yoga & Flexibility',
  'Pilates',
  'Weight Loss & Fat Reduction',
  'Nutrition & Dietetics',
  'Sports Injury & Rehabilitation',
  'Kettlebell Training',
  'Olympic Weightlifting',
  'Zumba & Aerobics',
  'Boxing & Kickboxing'
];

const GymAdminManageJobs: React.FC = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Edit Job Modal State (in-page editing)
  const [editingJob, setEditingJob] = useState<any | null>(null);
  const [editFormData, setEditFormData] = useState<any>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editSuccess, setEditSuccess] = useState<string | null>(null);
  const [customExpertiseInput, setCustomExpertiseInput] = useState('');

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

  const handleOpenEditModal = (job: any) => {
    setEditingJob(job);
    setEditError(null);
    setEditSuccess(null);
    setCustomExpertiseInput('');
    setEditFormData({
      title: job.title || '',
      expertise: Array.isArray(job.expertise) ? [...job.expertise] : [],
      description: job.description || '',
      responsibilities: job.responsibilities || '',
      experience: job.experience || '1-2 Years',
      qualifications: job.qualifications || '',
      certifications: job.certifications || '',
      salaryMin: job.salaryMin !== undefined && job.salaryMin !== null ? String(job.salaryMin) : '',
      salaryMax: job.salaryMax !== undefined && job.salaryMax !== null ? String(job.salaryMax) : '',
      salaryType: job.salaryType || 'Monthly',
      isSalaryNegotiable: Boolean(job.isSalaryNegotiable),
      employmentType: job.employmentType || 'Full-time',
      trainingMode: (job.trainingMode as 'Online' | 'Offline' | 'Hybrid') || 'Offline',
      location: job.location || '',
      workingHours: job.workingHours || '',
      vacanciesCount: job.vacanciesCount || 1,
      deadline: job.deadline ? new Date(job.deadline).toISOString().split('T')[0] : '',
      status: job.status || 'Published'
    });
  };

  const handleCloseEditModal = () => {
    setEditingJob(null);
    setEditFormData(null);
    setEditError(null);
    setEditSuccess(null);
    setCustomExpertiseInput('');
  };

  const toggleEditExpertise = (skill: string) => {
    if (!editFormData) return;
    setEditFormData((prev: any) => {
      const exists = prev.expertise.includes(skill);
      return {
        ...prev,
        expertise: exists
          ? prev.expertise.filter((s: string) => s !== skill)
          : [...prev.expertise, skill]
      };
    });
  };

  const handleAddCustomEditExpertise = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && customExpertiseInput.trim() && editFormData) {
      e.preventDefault();
      const val = customExpertiseInput.trim();
      if (!editFormData.expertise.includes(val)) {
        setEditFormData((prev: any) => ({
          ...prev,
          expertise: [...prev.expertise, val]
        }));
      }
      setCustomExpertiseInput('');
    }
  };

  const handleSaveEdit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!editingJob || !editFormData) return;

    if (!editFormData.title.trim()) {
      setEditError('Please enter a job title');
      return;
    }
    if (!editFormData.description.trim()) {
      setEditError('Please enter a job description');
      return;
    }
    if (!editFormData.location.trim()) {
      setEditError('Please enter a work location');
      return;
    }

    try {
      setEditLoading(true);
      setEditError(null);
      setEditSuccess(null);

      const payload = {
        ...editFormData,
        salaryMin: editFormData.salaryMin ? Number(editFormData.salaryMin) : undefined,
        salaryMax: editFormData.salaryMax ? Number(editFormData.salaryMax) : undefined,
        vacanciesCount: Number(editFormData.vacanciesCount) || 1,
        deadline: editFormData.deadline ? new Date(editFormData.deadline) : undefined
      };

      const res = await api.put(`/hiring/owner/jobs/${editingJob._id}`, payload);
      if (res.data.success) {
        const updated = res.data.job || { ...editingJob, ...payload };
        setJobs(prev => prev.map(j => (j._id === editingJob._id ? { ...j, ...updated } : j)));
        setEditSuccess('Job vacancy updated successfully!');
        setTimeout(() => {
          handleCloseEditModal();
        }, 800);
      }
    } catch (err: any) {
      console.error('Save error:', err);
      setEditError(err.response?.data?.message || 'Failed to update job vacancy');
    } finally {
      setEditLoading(false);
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
          <h1 className="text-2xl font-black text-[#111827] tracking-tight flex items-center gap-2.5">
            <Briefcase className="text-[#EA580C]" size={26} />
            <span>Trainer Hiring & Vacancies</span>
          </h1>
          <p className="text-xs text-[#64748B] mt-1">
            Create coaching vacancies, review trainer applications, and manage interview schedules.
          </p>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-4 shadow-lg flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[#FFF7ED] border border-[#FFEDD5] text-[#EA580C] flex items-center justify-center shrink-0">
            <Briefcase size={20} />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider">Total Vacancies</p>
            <p className="text-xl font-black text-[#111827]">{totalJobs}</p>
          </div>
        </div>

        <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-4 shadow-lg flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[#15803D] flex items-center justify-center shrink-0">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider">Active Published</p>
            <p className="text-xl font-black text-[#111827]">{publishedCount}</p>
          </div>
        </div>

        <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-4 shadow-lg flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
            <Users size={20} />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider">Total Applicants</p>
            <p className="text-xl font-black text-[#111827]">{totalApplicants}</p>
          </div>
        </div>

        <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-4 shadow-lg flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[#B45309] flex items-center justify-center shrink-0">
            <Award size={20} />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider">Trainers Hired</p>
            <p className="text-xl font-black text-[#111827]">{totalHired}</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-md">
        <form onSubmit={handleSearch} className="flex-1 w-full flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B]" size={16} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by vacancy title, expertise, or location..."
              className="w-full pl-10 pr-4 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-[#111827] placeholder:text-[#64748B]/60 focus:outline-none focus:border-[#FDBA74]"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-[#F8FAFC] hover:bg-[#C2410C] hover:text-[#FFFFFF] text-xs font-bold text-[#111827] rounded-xl border border-[#E2E8F0] transition-all"
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
                  ? 'bg-[#C2410C] text-white shadow-sm'
                  : 'bg-[#F8FAFC] text-[#64748B] hover:text-[#111827] border border-[#E2E8F0]'
              }`}
            >
              {st === 'all' ? 'All Status' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Vacancies List */}
      {loading ? (
        <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-3xl p-12 text-center text-sm text-[#64748B] flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-2 border-[#FDBA74] border-t-transparent rounded-full animate-spin" />
          <span>Loading vacancies...</span>
        </div>
      ) : jobs.length === 0 ? (
        <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-3xl p-12 text-center text-[#64748B]">
          <Briefcase className="mx-auto mb-3 text-[#EA580C]/40" size={42} />
          <h3 className="text-lg font-bold text-[#111827] mb-1">No vacancies found</h3>
          <p className="text-xs text-[#64748B] max-w-sm mx-auto mb-6">
            {searchTerm || statusFilter !== 'all' 
              ? 'No job vacancies match your selected filters. Try resetting search.' 
              : 'You have not posted any trainer vacancies yet. Create your first opening to attract certified coaches.'}
          </p>
          <Link
            to="/admin/hiring/jobs/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#C2410C] text-white text-xs font-bold rounded-xl hover:bg-[#9A3412] transition-all shadow-md shadow-orange-500/15"
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
              className="bg-[#FFFFFF] border border-[#E2E8F0] hover:border-[#FFEDD5] rounded-2xl p-5 sm:p-6 transition-all shadow-md group"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Left Info */}
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {isDeadlineCompleted(job.deadline) ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold border bg-red-500/15 text-[#B91C1C] border-red-500/30 flex items-center gap-1">
                        <AlertCircle size={11} /> Job Vacancy Over
                      </span>
                    ) : (
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        job.status === 'Published' 
                          ? 'bg-emerald-500/10 text-[#15803D] border-emerald-500/20' 
                          : job.status === 'Draft' 
                          ? 'bg-amber-500/10 text-[#B45309] border-amber-500/20' 
                          : 'bg-red-500/10 text-[#B91C1C] border-red-500/20'
                      }`}>
                        {job.status}
                      </span>
                    )}
                    <span className="text-[11px] text-[#64748B] flex items-center gap-1 font-semibold">
                      <Clock size={12} /> {job.employmentType}
                    </span>
                    <span className="text-[11px] text-[#64748B] flex items-center gap-1">
                      <MapPin size={12} className="text-[#EA580C]" /> {job.location}
                    </span>
                    {job.vacanciesCount > 1 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#F8FAFC] text-[#EA580C] border border-[#E2E8F0]">
                        {job.vacanciesCount} Openings
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-[#111827] group-hover:text-[#EA580C] transition-colors">
                    {job.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#64748B]">
                    <span className="flex items-center gap-1 font-semibold text-[#111827]">
                      <IndianRupee size={13} className="text-[#EA580C]" />
                      {job.salaryMin && job.salaryMax 
                        ? `₹${job.salaryMin.toLocaleString()} - ₹${job.salaryMax.toLocaleString()} / ${job.salaryType}` 
                        : (job.salaryMin ? `From ₹${job.salaryMin.toLocaleString()}` : 'Competitive / Negotiable')}
                    </span>
                    <span>• Experience: {job.experience}</span>
                    {job.deadline && (
                      <span className={`flex items-center gap-1 font-semibold ${isDeadlineCompleted(job.deadline) ? 'text-[#B91C1C]' : ''}`}>
                        • Deadline: {new Date(job.deadline).toLocaleDateString()}
                        {isDeadlineCompleted(job.deadline) && ' (Job Vacancy Over)'}
                      </span>
                    )}
                  </div>

                  {job.expertise && job.expertise.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {job.expertise.map((exp: string, idx: number) => (
                        <span key={idx} className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#F8FAFC] text-[#64748B] border border-[#E2E8F0]">
                          {exp}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right Applicant Stats & Action Buttons */}
                <div className="flex flex-wrap lg:flex-col items-end justify-between gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-[#E2E8F0]">
                  <div className="flex items-center gap-4 text-center">
                    <Link
                      to={`/admin/hiring/applications?jobId=${job._id}`}
                      className="bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#FFEDD5] rounded-xl px-3.5 py-1.5 transition-all text-center group/app"
                    >
                      <div className="text-base font-black text-[#EA580C] group-hover/app:scale-105 transition-transform">
                        {job.applicantsCount || 0}
                      </div>
                      <div className="text-[10px] font-bold text-[#64748B] uppercase">Applicants</div>
                    </Link>

                    <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3.5 py-1.5 text-center">
                      <div className="text-base font-black text-[#B45309]">
                        {job.shortlistedCount || 0}
                      </div>
                      <div className="text-[10px] font-bold text-[#64748B] uppercase">Shortlisted</div>
                    </div>

                    <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3.5 py-1.5 text-center">
                      <div className="text-base font-black text-[#15803D]">
                        {job.hiredCount || 0}
                      </div>
                      <div className="text-[10px] font-bold text-[#64748B] uppercase">Hired</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleStatus(job._id, job.status)}
                      disabled={actionLoading === job._id}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                        job.status === 'Published'
                          ? 'bg-[#F8FAFC] text-[#B91C1C] border-red-500/20 hover:bg-red-500/10'
                          : 'bg-[#F8FAFC] text-[#15803D] border-emerald-500/20 hover:bg-emerald-500/10'
                      }`}
                    >
                      {job.status === 'Published' ? 'Close Job' : 'Publish Job'}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(job)}
                      className="p-2 bg-[#F8FAFC] hover:bg-[#FFF7ED] text-[#111827] hover:text-[#EA580C] rounded-xl border border-[#E2E8F0] hover:border-[#FDBA74] transition-all cursor-pointer shadow-2xs"
                      title="Edit Job Vacancy"
                    >
                      <Edit3 size={15} />
                    </button>

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
                          className="px-2.5 py-1.5 bg-[#F8FAFC] text-[#64748B] rounded-xl text-xs"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirmId(job._id)}
                        className="p-2 bg-[#F8FAFC] hover:bg-red-500/20 text-[#64748B] hover:text-[#B91C1C] rounded-xl border border-[#E2E8F0] transition-all"
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

      {/* In-Page Edit Job Vacancy Modal */}
      {editingJob && editFormData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
          <div
            className="relative w-full max-w-3xl my-8 bg-[#FFFFFF] border border-[#E2E8F0] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-[#E2E8F0] flex items-center justify-between gap-3 bg-gradient-to-r from-[#FFF7ED] via-[#FFFFFF] to-[#FFFFFF] shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#FFF7ED] border border-[#FFEDD5] text-[#EA580C] flex items-center justify-center shrink-0 shadow-xs">
                  <Briefcase size={22} />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-[#111827] tracking-tight">
                    Edit Job Vacancy
                  </h2>
                  <p className="text-xs text-[#64748B] mt-0.5 truncate max-w-xs sm:max-w-md">
                    Updating: <span className="font-semibold text-[#111827]">{editingJob.title}</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseEditModal}
                disabled={editLoading}
                className="w-9 h-9 rounded-xl bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#64748B] hover:text-[#111827] border border-[#E2E8F0] flex items-center justify-center transition-all cursor-pointer shrink-0"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleSaveEdit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
              {/* Error & Success Alerts */}
              {editError && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-500/30 text-[#B91C1C] text-xs flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{editError}</span>
                </div>
              )}
              {editSuccess && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-500/30 text-[#15803D] text-xs flex items-center gap-2">
                  <CheckCircle2 size={16} className="shrink-0" />
                  <span>{editSuccess}</span>
                </div>
              )}

              {/* 1. Job Title & Status */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-[#111827] mb-1.5">
                    Job Title <span className="text-[#B91C1C]">*</span>
                  </label>
                  <input
                    type="text"
                    value={editFormData.title}
                    onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                    placeholder="e.g. Senior Strength & Conditioning Coach"
                    className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-[#111827] focus:outline-none focus:border-[#FDBA74]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#111827] mb-1.5">
                    Job Status
                  </label>
                  <select
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-[#111827] font-semibold focus:outline-none focus:border-[#FDBA74]"
                  >
                    <option value="Published">Published (Active)</option>
                    <option value="Draft">Draft</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </div>

              {/* 2. Employment Type, Required Experience & Vacancies */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#111827] mb-1.5">
                    Employment Type <span className="text-[#B91C1C]">*</span>
                  </label>
                  <select
                    value={editFormData.employmentType}
                    onChange={(e) => setEditFormData({ ...editFormData, employmentType: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-[#111827] focus:outline-none focus:border-[#FDBA74]"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#111827] mb-1.5">
                    Required Experience <span className="text-[#B91C1C]">*</span>
                  </label>
                  <select
                    value={editFormData.experience}
                    onChange={(e) => setEditFormData({ ...editFormData, experience: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-[#111827] focus:outline-none focus:border-[#FDBA74]"
                  >
                    <option value="Fresher / Entry Level">Fresher / Entry Level</option>
                    <option value="1-2 Years">1-2 Years</option>
                    <option value="3-5 Years">3-5 Years</option>
                    <option value="5-8 Years">5-8 Years</option>
                    <option value="8+ Years (Master Trainer)">8+ Years (Master Trainer)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#111827] mb-1.5">
                    Number of Vacancies <span className="text-[#B91C1C]">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={editFormData.vacanciesCount}
                    onChange={(e) => setEditFormData({ ...editFormData, vacanciesCount: Math.max(1, parseInt(e.target.value) || 1) })}
                    className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-[#111827] focus:outline-none focus:border-[#FDBA74]"
                  />
                </div>
              </div>

              {/* 3. Expertise & Coaching Domains */}
              <div>
                <label className="block text-xs font-bold text-[#111827] mb-1.5">
                  Coaching Domains & Expertise
                </label>
                <p className="text-[11px] text-[#64748B] mb-2.5">
                  Click to select or remove specializations required for this position.
                </p>
                <div className="flex flex-wrap gap-1.5 mb-3 max-h-36 overflow-y-auto p-1 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0]/70">
                  {COMMON_EXPERTISE.map((skill) => {
                    const isSelected = editFormData.expertise?.includes(skill);
                    return (
                      <button
                        type="button"
                        key={skill}
                        onClick={() => toggleEditExpertise(skill)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                          isSelected
                            ? 'bg-[#C2410C] text-white border-[#FDBA74] shadow-xs'
                            : 'bg-[#FFFFFF] text-[#64748B] hover:text-[#111827] border-[#E2E8F0] hover:border-[#FDBA74]'
                        }`}
                      >
                        {skill}
                      </button>
                    );
                  })}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={customExpertiseInput}
                    onChange={(e) => setCustomExpertiseInput(e.target.value)}
                    onKeyDown={handleAddCustomEditExpertise}
                    placeholder="Type custom skill and press Enter..."
                    className="w-full max-w-sm px-3.5 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-[#111827] focus:outline-none focus:border-[#FDBA74]"
                  />
                  {customExpertiseInput.trim() && (
                    <button
                      type="button"
                      onClick={() => {
                        const val = customExpertiseInput.trim();
                        if (!editFormData.expertise.includes(val)) {
                          setEditFormData({
                            ...editFormData,
                            expertise: [...editFormData.expertise, val]
                          });
                        }
                        setCustomExpertiseInput('');
                      }}
                      className="px-3 py-2 bg-[#FFF7ED] text-[#EA580C] hover:bg-[#FFEDD5] border border-[#FDBA74] rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      Add
                    </button>
                  )}
                </div>
              </div>

              {/* 4. Training Mode */}
              <div>
                <label className="block text-xs font-bold text-[#111827] mb-1.5">
                  Training Mode <span className="text-[#B91C1C]">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {(['Online', 'Offline', 'Hybrid'] as const).map((mode) => {
                    const icons: Record<string, string> = { Online: '💻', Offline: '🏋️', Hybrid: '🔄' };
                    const descriptions: Record<string, string> = {
                      Online: 'Remote sessions',
                      Offline: 'In-person at gym',
                      Hybrid: 'Blended delivery'
                    };
                    const isSelected = editFormData.trainingMode === mode;
                    return (
                      <button
                        type="button"
                        key={mode}
                        onClick={() => setEditFormData({ ...editFormData, trainingMode: mode })}
                        className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#FFF7ED] border-[#FDBA74] text-[#EA580C] shadow-xs'
                            : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#64748B] hover:border-[#FDBA74] hover:text-[#111827]'
                        }`}
                      >
                        <span className="text-base">{icons[mode]}</span>
                        <div className="flex-1 min-w-0">
                          <div className={`text-xs font-bold ${isSelected ? 'text-[#EA580C]' : 'text-[#111827]'}`}>
                            {mode}
                          </div>
                          <div className="text-[10px] text-[#64748B] truncate">{descriptions[mode]}</div>
                        </div>
                        {isSelected && <CheckCircle2 size={14} className="text-[#EA580C] shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 5. Compensation / Salary Range */}
              <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#111827] flex items-center gap-1.5">
                    <IndianRupee size={14} className="text-[#EA580C]" />
                    <span>Salary & Compensation Structure</span>
                  </span>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={editFormData.isSalaryNegotiable}
                      onChange={(e) => setEditFormData({ ...editFormData, isSalaryNegotiable: e.target.checked })}
                      className="rounded text-[#EA580C] focus:ring-0 bg-[#FFFFFF] border-[#E2E8F0]"
                    />
                    <span className="text-xs text-[#64748B]">Negotiable</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-[#64748B] mb-1">Min Salary (₹)</label>
                    <input
                      type="number"
                      placeholder="e.g. 25000"
                      value={editFormData.salaryMin}
                      onChange={(e) => setEditFormData({ ...editFormData, salaryMin: e.target.value })}
                      className="w-full px-3.5 py-2 bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl text-xs text-[#111827] focus:outline-none focus:border-[#FDBA74]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-[#64748B] mb-1">Max Salary (₹)</label>
                    <input
                      type="number"
                      placeholder="e.g. 45000"
                      value={editFormData.salaryMax}
                      onChange={(e) => setEditFormData({ ...editFormData, salaryMax: e.target.value })}
                      className="w-full px-3.5 py-2 bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl text-xs text-[#111827] focus:outline-none focus:border-[#FDBA74]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-[#64748B] mb-1">Frequency</label>
                    <select
                      value={editFormData.salaryType}
                      onChange={(e) => setEditFormData({ ...editFormData, salaryType: e.target.value })}
                      className="w-full px-3.5 py-2 bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl text-xs text-[#111827] focus:outline-none focus:border-[#FDBA74]"
                    >
                      <option value="Monthly">Per Month</option>
                      <option value="Hourly">Per Hour</option>
                      <option value="Per Session">Per Session</option>
                      <option value="Annual">Per Annum (CTC)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 6. Location, Working Hours & Application Deadline */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#111827] mb-1.5 flex items-center gap-1.5">
                    <MapPin size={13} className="text-[#EA580C]" /> Location <span className="text-[#B91C1C]">*</span>
                  </label>
                  <input
                    type="text"
                    value={editFormData.location}
                    onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                    placeholder="e.g. Indiranagar, Bangalore"
                    className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-[#111827] focus:outline-none focus:border-[#FDBA74]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#111827] mb-1.5 flex items-center gap-1.5">
                    <Clock size={13} className="text-[#EA580C]" /> Working Hours / Shift
                  </label>
                  <input
                    type="text"
                    value={editFormData.workingHours}
                    onChange={(e) => setEditFormData({ ...editFormData, workingHours: e.target.value })}
                    placeholder="e.g. 6:00 AM - 2:00 PM"
                    className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-[#111827] focus:outline-none focus:border-[#FDBA74]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#111827] mb-1.5 flex items-center gap-1.5">
                    <Calendar size={13} className="text-[#EA580C]" /> Application Deadline
                  </label>
                  <input
                    type="date"
                    value={editFormData.deadline}
                    onChange={(e) => setEditFormData({ ...editFormData, deadline: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-[#111827] focus:outline-none focus:border-[#FDBA74]"
                  />
                  {editFormData.deadline && new Date(editFormData.deadline).setHours(23, 59, 59, 999) < Date.now() && (
                    <p className="text-[10px] text-[#B91C1C] mt-1 flex items-center gap-1 font-semibold">
                      <AlertCircle size={11} /> Deadline expired
                    </p>
                  )}
                </div>
              </div>

              {/* 7. Job Description */}
              <div>
                <label className="block text-xs font-bold text-[#111827] mb-1.5">
                  Job Description <span className="text-[#B91C1C]">*</span>
                </label>
                <textarea
                  rows={3}
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  placeholder="Provide an overview of this coaching vacancy..."
                  className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-[#111827] focus:outline-none focus:border-[#FDBA74] leading-relaxed"
                  required
                />
              </div>

              {/* 8. Key Responsibilities */}
              <div>
                <label className="block text-xs font-bold text-[#111827] mb-1.5">
                  Key Responsibilities
                </label>
                <textarea
                  rows={2}
                  value={editFormData.responsibilities}
                  onChange={(e) => setEditFormData({ ...editFormData, responsibilities: e.target.value })}
                  placeholder="• Conduct member fitness assessments and 1-on-1 personal training..."
                  className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-[#111827] focus:outline-none focus:border-[#FDBA74] leading-relaxed"
                />
              </div>

              {/* 9. Qualifications & Certifications */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#111827] mb-1.5">
                    Required Qualifications
                  </label>
                  <input
                    type="text"
                    value={editFormData.qualifications}
                    onChange={(e) => setEditFormData({ ...editFormData, qualifications: e.target.value })}
                    placeholder="e.g. Degree in Physical Education or Sports Science"
                    className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-[#111827] focus:outline-none focus:border-[#FDBA74]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#111827] mb-1.5">
                    Preferred Certifications
                  </label>
                  <input
                    type="text"
                    value={editFormData.certifications}
                    onChange={(e) => setEditFormData({ ...editFormData, certifications: e.target.value })}
                    placeholder="e.g. ACE, NASM, ISSA, CPR / AED"
                    className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-[#111827] focus:outline-none focus:border-[#FDBA74]"
                  />
                </div>
              </div>
            </form>

            {/* Modal Footer */}
            <div className="p-4 sm:px-6 border-t border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={handleCloseEditModal}
                disabled={editLoading}
                className="px-4 py-2.5 bg-[#FFFFFF] hover:bg-[#F1F5F9] text-xs font-bold text-[#64748B] hover:text-[#111827] rounded-xl border border-[#E2E8F0] transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={editLoading}
                className="px-5 py-2.5 bg-[#C2410C] hover:bg-[#9A3412] text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-orange-500/15 disabled:opacity-60"
              >
                {editLoading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <Save size={14} />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GymAdminManageJobs;
