import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import {
  Activity,
  ArrowLeft,
  Briefcase,
  MapPin,
  Clock,
  IndianRupee,
  Search,
  Filter,
  Building2,
  CheckCircle,
  Sparkles,
  Upload,
  X,
  FileText,
  UserCheck,
  ChevronRight,
  ExternalLink,
  Award,
  AlertCircle,
  Calendar
} from 'lucide-react';

interface Vacancy {
  _id: string;
  gymName: string;
  title: string;
  expertise: string[];
  description: string;
  responsibilities?: any;
  qualifications?: any;
  certifications?: any;
  experience?: string;
  experienceRequired?: number;
  salaryMin?: number;
  salaryMax?: number;
  salaryType: string;
  isSalaryNegotiable?: boolean;
  employmentType: string;
  location: string;
  workingHours?: string;
  vacanciesCount: number;
  applicationDeadline?: string;
  deadline?: string;
  status: string;
}

export default function Careers() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const targetJobId = searchParams.get('jobId');

  const { user, isAuthenticated } = useAuth();

  const [jobs, setJobs] = useState<Vacancy[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [employmentFilter, setEmploymentFilter] = useState('');
  const [experienceFilter, setExperienceFilter] = useState('');

  // Selected job for detail / apply
  const [selectedJob, setSelectedJob] = useState<Vacancy | null>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [appliedJobs, setAppliedJobs] = useState<string[]>([]);

  // Application form
  const [form, setForm] = useState({
    fullName: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '',
    email: user?.email || '',
    phone: user?.phone || '',
    yearsOfExperience: '2',
    qualifications: '',
    certifications: '',
    expertise: '',
    expectedSalary: '',
    preferredLocation: '',
    employmentPreference: 'Full-time',
    availability: 'Immediate',
    coverLetter: ''
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  useEffect(() => {
    fetchJobs();
    if (isAuthenticated && user?.role === 'TRAINER') {
      fetchMyApplications();
    }
  }, [locationFilter, employmentFilter, experienceFilter]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (locationFilter) params.location = locationFilter;
      if (employmentFilter) params.employmentType = employmentFilter;
      if (experienceFilter) params.experience = experienceFilter;

      const res = await axios.get('http://localhost:5600/api/hiring/jobs', { params });
      if (res.data.success) {
        const list = res.data.data || res.data.jobs || [];
        setJobs(list);
        const autoApply = searchParams.get('autoApply') === 'true';
        if (targetJobId) {
          const match = list.find((j: Vacancy) => j._id === targetJobId);
          if (match) {
            setSelectedJob(match);
            if (autoApply && isAuthenticated && user?.role === 'TRAINER') {
              setForm(prev => ({
                ...prev,
                fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || prev.fullName,
                email: user.email || prev.email,
                phone: (user as any)?.mobile || prev.phone,
                expertise: match.expertise?.join(', ') || prev.expertise,
                expectedSalary: match.salaryMin ? `₹${match.salaryMin.toLocaleString()}` : prev.expectedSalary,
                preferredLocation: match.location || prev.preferredLocation,
                employmentPreference: match.employmentType || prev.employmentPreference,
                coverLetter: `I am passionate about personal training and excited to apply for the ${match.title} role at ${match.gymName}.`
              }));
              setShowApplyModal(true);
            }
          }
        }
      }
    } catch (err) {
      console.error('Failed to load published vacancies:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyApplications = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await axios.get('http://localhost:5600/api/hiring/trainer/applications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        const ids = res.data.data.map((app: any) => app.jobId?._id || app.jobId);
        setAppliedJobs(ids);
      }
    } catch (err) {
      console.error('Failed to load trainer applications:', err);
    }
  };

  const isDeadlineCompleted = (deadline?: string) => {
    if (!deadline) return false;
    const d = new Date(deadline);
    d.setHours(23, 59, 59, 999);
    return d.getTime() < Date.now();
  };

  const renderListOrText = (val: any) => {
    if (!val) return null;
    if (Array.isArray(val)) {
      const items = val.map(s => String(s).trim()).filter(Boolean);
      if (items.length === 0) return null;
      return (
        <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
          {items.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      );
    }
    if (typeof val === 'string') {
      const trimmed = val.trim();
      if (!trimmed) return null;
      const lines = trimmed.split(/\r?\n|•/).map(s => s.trim()).filter(Boolean);
      if (lines.length > 1) {
        return (
          <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
            {lines.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        );
      }
      return <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">{trimmed}</p>;
    }
    return null;
  };

  const handleApplyClick = (job: Vacancy) => {
    const deadline = job.applicationDeadline || (job as any).deadline;
    if (isDeadlineCompleted(deadline)) {
      alert('This job vacancy is over because the application deadline has completed.');
      return;
    }

    // 1. Check if user is authenticated and is a TRAINER
    if (!isAuthenticated || user?.role !== 'TRAINER') {
      const returnUrl = encodeURIComponent(`/careers?jobId=${job._id}&autoApply=true`);
      navigate(`/register/trainer?jobId=${job._id}&returnUrl=${returnUrl}`);
      return;
    }

    // Prepopulate
    setSelectedJob(job);
    setForm({
      fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || (user as any)?.name || '',
      email: user.email || '',
      phone: (user as any)?.phone || '',
      yearsOfExperience: '2',
      qualifications: 'B.Sc. Exercise Science / Certified Fitness Coach',
      certifications: 'CPR/AED Certified, ACE Personal Trainer',
      expertise: job.expertise?.join(', ') || 'Strength Conditioning, HIIT',
      expectedSalary: job.salaryMin ? `₹${job.salaryMin.toLocaleString()}` : '',
      preferredLocation: job.location,
      employmentPreference: job.employmentType,
      availability: 'Immediate',
      coverLetter: `I am passionate about personal training and excited to apply for the ${job.title} role at ${job.gymName}.`
    });
    setShowApplyModal(true);
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;

    if (!resumeFile) {
      alert('Please select and upload your resume document (PDF, DOC, DOCX up to 10MB).');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('jobId', selectedJob._id);
      formData.append('fullName', form.fullName);
      formData.append('email', form.email);
      formData.append('phone', form.phone);
      formData.append('yearsOfExperience', form.yearsOfExperience);
      formData.append('qualifications', form.qualifications);
      formData.append('certifications', form.certifications);
      formData.append('expertise', form.expertise);
      formData.append('expectedSalary', form.expectedSalary);
      formData.append('preferredLocation', form.preferredLocation);
      formData.append('employmentPreference', form.employmentPreference);
      formData.append('availability', form.availability);
      formData.append('coverLetter', form.coverLetter);
      formData.append('resume', resumeFile);

      const res = await axios.post('http://localhost:5600/api/hiring/trainer/apply', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (res.data.success) {
        alert(
          'Application submitted successfully! The Gym Owner has been notified and you can track status in your Trainer Dashboard.'
        );
        setAppliedJobs((prev) => [...prev, selectedJob._id]);
        setShowApplyModal(false);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredJobs = jobs.filter((j) => {
    const term = search.toLowerCase();
    return (
      j.title.toLowerCase().includes(term) ||
      j.gymName.toLowerCase().includes(term) ||
      j.location.toLowerCase().includes(term) ||
      j.expertise.some((e) => e.toLowerCase().includes(term))
    );
  });

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#111827] selection:bg-[#C2410C] selection:text-black">
      {/* Navbar */}
      <nav className="border-b border-[#E2E8F0] bg-[#FFFFFF]/95 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/trainers"
              className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 hover:text-[#C2410C] bg-[#FFFFFF] hover:bg-[#FFF7ED] border border-[#E2E8F0] hover:border-[#FFEDD5] transition-all flex items-center gap-2 group"
            >
              <ArrowLeft size={16} className="text-[#EA580C] group-hover:-translate-x-0.5 transition-transform" />
              <span>Back</span>
            </Link>

            <Link to="/" className="flex items-center space-x-2.5">
              <div className="w-10 h-10 bg-[#C2410C] rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/15">
                <Activity className="text-black" size={24} />
              </div>
              <span className="text-2xl font-bold tracking-tight text-[#111827]">Gymora</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#FFF7ED] text-[#EA580C] border border-[#FFEDD5] font-semibold uppercase tracking-wider ml-2">
                Careers Portal
              </span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {isAuthenticated && user?.role === 'TRAINER' ? (
              <Link
                to="/trainer/applications"
                className="px-4 py-2 bg-[#C2410C] hover:bg-[#9A3412] text-white font-semibold rounded-xl text-sm transition-all shadow-md shadow-orange-500/15"
              >
                My Dashboard
              </Link>
            ) : (
              <Link
                to="/register/trainer"
                className="px-4 py-2 bg-[#C2410C] hover:bg-[#9A3412] text-white font-semibold rounded-xl text-sm transition-all shadow-md shadow-orange-500/15"
              >
                Trainer Register
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative py-16 px-4 sm:px-6 lg:px-8 border-b border-[#E2E8F0] bg-gradient-to-b from-[#F8FAFC] via-[#FFFFFF] to-[#FFFFFF] overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#B76E79_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-4">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFF7ED] text-[#EA580C] border border-[#FFEDD5] text-xs font-semibold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" /> Verified Gym Trainer Vacancies
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#111827] tracking-tight">
            Find High-Paying <span className="text-[#EA580C]">Gym Coaching Jobs</span>
          </h1>
          <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Apply to top fitness clubs, CrossFit boxes, and wellness centers. Connect directly with
            authorized gym owners and accelerate your coaching career.
          </p>

          {/* Quick Stats Banner */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-600 font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-[#EA580C]" /> Direct Owner Hiring
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-[#EA580C]" /> Transparent Salary Ranges
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-[#EA580C]" /> Rapid Interview Scheduling
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Search & Filters */}
        <div className="bg-[#F8FAFC] p-5 rounded-2xl border border-[#E2E8F0] shadow-xl space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by job title, gym name, specialization (e.g. Strength, Yoga, Crossfit)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl text-[#111827] placeholder-slate-500 text-sm focus:outline-none focus:border-[#FDBA74]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-[#E2E8F0]">
            <div>
              <label className="text-[11px] font-bold uppercase text-slate-700 block mb-1">
                Location
              </label>
              <input
                type="text"
                placeholder="City or state..."
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl text-[#111827] text-xs placeholder-slate-500 focus:outline-none focus:border-[#FDBA74]"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase text-slate-700 block mb-1">
                Employment Type
              </label>
              <select
                value={employmentFilter}
                onChange={(e) => setEmploymentFilter(e.target.value)}
                className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl text-[#111827] text-xs focus:outline-none focus:border-[#FDBA74]"
              >
                <option value="">All Employment Types</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase text-slate-700 block mb-1">
                Minimum Experience
              </label>
              <select
                value={experienceFilter}
                onChange={(e) => setExperienceFilter(e.target.value)}
                className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl text-[#111827] text-xs focus:outline-none focus:border-[#FDBA74]"
              >
                <option value="">Any Experience</option>
                <option value="1">1+ Years</option>
                <option value="3">3+ Years</option>
                <option value="5">5+ Years</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span>
            Showing <strong className="text-[#111827]">{filteredJobs.length}</strong> active published
            gym opportunities
          </span>
          <span>Only verified, authenticated gym vacancies</span>
        </div>

        {/* Vacancies Grid */}
        {loading ? (
          <div className="p-16 text-center text-slate-400 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0]">
            <div className="inline-block animate-spin w-8 h-8 border-4 border-[#FDBA74] border-t-transparent rounded-full mb-3" />
            <p>Loading gym opportunities...</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="p-16 text-center bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0]">
            <Briefcase className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-[#111827] mb-1">No vacancies found</h3>
            <p className="text-sm text-slate-400 max-w-md mx-auto">
              There are currently no active job vacancies matching your search or filters. Check back
              soon or clear your search criteria.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map((job) => {
              const isApplied = appliedJobs.includes(job._id);
              const deadline = job.applicationDeadline || (job as any).deadline;
              const isOver = isDeadlineCompleted(deadline);

              return (
                <div
                  key={job._id}
                  className="bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#FFEDD5] rounded-2xl p-6 transition-all flex flex-col justify-between space-y-4 shadow-xl group hover:shadow-2xl hover:shadow-orange-500/15"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <span className="text-xs text-[#EA580C] font-semibold flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5" />
                          {job.gymName}
                        </span>
                        <h3 className="text-xl font-bold text-[#111827] group-hover:text-[#EA580C] transition-colors mt-1">
                          {job.title}
                        </h3>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-[11px] bg-[#FFFFFF] text-slate-700 px-2.5 py-0.5 rounded-full border border-[#E2E8F0] font-semibold whitespace-nowrap">
                          {job.employmentType}
                        </span>
                        {isOver && (
                          <span className="text-[10px] bg-red-500/15 text-[#B91C1C] px-2.5 py-0.5 rounded-full border border-red-500/30 whitespace-nowrap font-bold flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> Job Vacancy Over
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2 text-xs text-slate-600 my-4 bg-[#FFFFFF] p-3.5 rounded-xl border border-[#E2E8F0]">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="text-slate-600 truncate">{job.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <IndianRupee className="w-3.5 h-3.5 text-[#EA580C] shrink-0" />
                        <span className="text-[#111827] font-bold font-mono">
                          {job.salaryMin
                            ? `₹${job.salaryMin.toLocaleString()} - ₹${job.salaryMax?.toLocaleString()} / ${job.salaryType}`
                            : 'Competitive'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="text-slate-600">
                          {job.experience || (job.experienceRequired ? `${job.experienceRequired}+ years required experience` : 'Any experience welcome')}
                        </span>
                      </div>
                      {deadline && (
                        <div className={`flex items-center gap-2 ${isOver ? 'text-[#B91C1C] font-semibold' : 'text-slate-600'}`}>
                          <Calendar className="w-3.5 h-3.5 shrink-0" />
                          <span>Deadline: {new Date(deadline).toLocaleDateString()} {isOver ? '(Job Vacancy Over)' : ''}</span>
                        </div>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {job.description}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {job.expertise?.slice(0, 3).map((exp, i) => (
                        <span
                          key={i}
                          className="text-[10px] bg-[#F8FAFC] text-slate-600 px-2.5 py-1 rounded-lg border border-[#E2E8F0]"
                        >
                          {exp}
                        </span>
                      ))}
                      {job.expertise?.length > 3 && (
                        <span className="text-[10px] text-slate-500 self-center">
                          +{job.expertise.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-between gap-2">
                    <button
                      onClick={() => setSelectedJob(job)}
                      className="px-3.5 py-2 bg-[#FFFFFF] hover:bg-[#FFF7ED] text-slate-600 hover:text-[#C2410C] rounded-xl text-xs font-medium border border-[#E2E8F0] transition-all"
                    >
                      View Details
                    </button>

                    {isApplied ? (
                      <span className="px-4 py-2 bg-emerald-500/10 text-[#15803D] border border-emerald-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Applied
                      </span>
                    ) : isOver ? (
                      <span className="px-4 py-2 bg-red-500/15 text-[#B91C1C] border border-red-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-not-allowed">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Job Vacancy Over
                      </span>
                    ) : (
                      <button
                        onClick={() => handleApplyClick(job)}
                        className="px-4 py-2 bg-[#C2410C] hover:bg-[#9A3412] text-white font-semibold rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-md shadow-orange-500/15"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        Apply Now
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* View Details Modal */}
      {selectedJob && !showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl max-w-2xl w-full p-6 text-[#1F2937] space-y-5 max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-[#E2E8F0] pb-4">
              <div>
                <span className="text-xs text-[#EA580C] font-semibold flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" />
                  {selectedJob.gymName}
                </span>
                <h2 className="text-2xl font-bold text-[#111827] mt-1">{selectedJob.title}</h2>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="text-[11px] bg-[#FFFFFF] text-slate-700 px-2.5 py-0.5 rounded-full border border-[#E2E8F0] font-semibold">
                    {selectedJob.employmentType}
                  </span>
                  <span className="text-[11px] bg-[#FFFFFF] text-[#EA580C] px-2.5 py-0.5 rounded-full border border-[#E2E8F0] font-medium">
                    {selectedJob.vacanciesCount || 1} {Number(selectedJob.vacanciesCount) > 1 ? 'Openings' : 'Opening'}
                  </span>
                  {selectedJob.isSalaryNegotiable && (
                    <span className="text-[11px] bg-emerald-500/10 text-[#15803D] px-2.5 py-0.5 rounded-full border border-emerald-500/20 font-medium">
                      Salary Negotiable
                    </span>
                  )}
                  {isDeadlineCompleted(selectedJob.applicationDeadline || (selectedJob as any).deadline) && (
                    <span className="text-[11px] bg-red-500/15 text-[#B91C1C] px-2.5 py-0.5 rounded-full border border-red-500/30 font-bold flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Job Vacancy Over
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setSelectedJob(null)}
                className="text-[#64748B] hover:text-[#C2410C] p-1 rounded-lg hover:bg-[#FFFFFF]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Comprehensive Job Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-[#FFFFFF] p-3 rounded-xl border border-[#E2E8F0] flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-[#EA580C] shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Location</span>
                  <span className="text-slate-700 font-medium">{selectedJob.location || 'On-site'}</span>
                </div>
              </div>

              <div className="bg-[#FFFFFF] p-3 rounded-xl border border-[#E2E8F0] flex items-center gap-2.5">
                <IndianRupee className="w-4 h-4 text-[#EA580C] shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Salary / Compensation</span>
                  <span className="text-[#111827] font-mono font-bold">
                    {selectedJob.salaryMin && selectedJob.salaryMax
                      ? `₹${selectedJob.salaryMin.toLocaleString()} - ₹${selectedJob.salaryMax.toLocaleString()} / ${selectedJob.salaryType || 'Monthly'}`
                      : (selectedJob.salaryMin ? `From ₹${selectedJob.salaryMin.toLocaleString()}` : 'Competitive / Negotiable')}
                  </span>
                </div>
              </div>

              <div className="bg-[#FFFFFF] p-3 rounded-xl border border-[#E2E8F0] flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-[#EA580C] shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Required Experience</span>
                  <span className="text-slate-700 font-medium">
                    {selectedJob.experience || (selectedJob.experienceRequired ? `${selectedJob.experienceRequired}+ years` : 'Flexible / Any')}
                  </span>
                </div>
              </div>

              <div className="bg-[#FFFFFF] p-3 rounded-xl border border-[#E2E8F0] flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-[#EA580C] shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Application Deadline</span>
                  {selectedJob.applicationDeadline || (selectedJob as any).deadline ? (
                    <span className={`font-medium ${isDeadlineCompleted(selectedJob.applicationDeadline || (selectedJob as any).deadline) ? 'text-[#B91C1C] font-bold' : 'text-slate-700'}`}>
                      {new Date(selectedJob.applicationDeadline || (selectedJob as any).deadline).toLocaleDateString()}
                      {isDeadlineCompleted(selectedJob.applicationDeadline || (selectedJob as any).deadline) ? ' (Job Vacancy Over)' : ''}
                    </span>
                  ) : (
                    <span className="text-slate-400">Open until filled</span>
                  )}
                </div>
              </div>

              {selectedJob.workingHours && (
                <div className="bg-[#FFFFFF] p-3 rounded-xl border border-[#E2E8F0] flex items-center gap-2.5 sm:col-span-2">
                  <Clock className="w-4 h-4 text-[#EA580C] shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">Shift & Working Hours</span>
                    <span className="text-slate-700 font-medium">{selectedJob.workingHours}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Job Description */}
            <div>
              <h4 className="text-xs uppercase font-semibold text-[#EA580C] mb-2">
                Job Overview & Description
              </h4>
              <p className="text-sm text-slate-700 leading-relaxed bg-[#FFFFFF] p-4 rounded-xl border border-[#E2E8F0] whitespace-pre-line">
                {selectedJob.description || 'No detailed description provided.'}
              </p>
            </div>

            {/* Specializations / Expertise */}
            {selectedJob.expertise && selectedJob.expertise.length > 0 && (
              <div>
                <h4 className="text-xs uppercase font-semibold text-[#EA580C] mb-2">
                  Required Specializations & Skills
                </h4>
                <div className="flex flex-wrap gap-1.5 bg-[#FFFFFF] p-3.5 rounded-xl border border-[#E2E8F0]">
                  {selectedJob.expertise.map((exp: string, idx: number) => (
                    <span
                      key={idx}
                      className="text-xs bg-[#F8FAFC] text-slate-700 px-3 py-1 rounded-lg border border-[#E2E8F0]"
                    >
                      {exp}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Key Responsibilities */}
            {Boolean(selectedJob.responsibilities) && (
              <div>
                <h4 className="text-xs uppercase font-semibold text-[#EA580C] mb-2">
                  Key Responsibilities
                </h4>
                <div className="bg-[#FFFFFF] p-4 rounded-xl border border-[#E2E8F0]">
                  {renderListOrText(selectedJob.responsibilities)}
                </div>
              </div>
            )}

            {/* Qualifications & Certifications */}
            {(Boolean(selectedJob.qualifications) || Boolean(selectedJob.certifications)) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Boolean(selectedJob.qualifications) && (
                  <div className="bg-[#FFFFFF] p-4 rounded-xl border border-[#E2E8F0]">
                    <h4 className="text-xs uppercase font-semibold text-slate-400 mb-2">
                      Qualifications
                    </h4>
                    {renderListOrText(selectedJob.qualifications)}
                  </div>
                )}

                {Boolean(selectedJob.certifications) && (
                  <div className="bg-[#FFFFFF] p-4 rounded-xl border border-[#E2E8F0]">
                    <h4 className="text-xs uppercase font-semibold text-slate-400 mb-2">
                      Certifications
                    </h4>
                    {renderListOrText(selectedJob.certifications)}
                  </div>
                )}
              </div>
            )}

            {/* Deadline Over Alert */}
            {isDeadlineCompleted(selectedJob.applicationDeadline || (selectedJob as any).deadline) && (
              <div className="p-3.5 bg-red-500/15 border border-red-500/30 rounded-xl text-[#B91C1C] text-xs flex items-center gap-2.5 font-semibold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Job Vacancy Over: The application deadline for this position has completed.</span>
              </div>
            )}

            {/* Footer Buttons */}
            <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-between">
              <span className="text-xs text-slate-600 font-medium">
                {selectedJob.vacanciesCount || 1} {Number(selectedJob.vacanciesCount) > 1 ? 'openings available' : 'opening available'}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedJob(null)}
                  className="px-4 py-2 bg-[#FFFFFF] hover:bg-[#FFF7ED] text-slate-700 hover:text-[#C2410C] rounded-xl text-xs font-semibold border border-[#E2E8F0] transition-colors"
                >
                  Close
                </button>
                {appliedJobs.includes(selectedJob._id) ? (
                  <span className="px-4 py-2 bg-emerald-500/10 text-[#15803D] border border-emerald-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Already Applied
                  </span>
                ) : isDeadlineCompleted(selectedJob.applicationDeadline || (selectedJob as any).deadline) ? (
                  <span className="px-4 py-2 bg-red-500/15 text-[#B91C1C] border border-red-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-not-allowed">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Job Vacancy Over
                  </span>
                ) : (
                  <button
                    onClick={() => handleApplyClick(selectedJob)}
                    className="px-5 py-2 bg-[#C2410C] hover:bg-[#9A3412] text-white font-semibold rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-md shadow-orange-500/15"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Apply for this Position
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Apply Form Modal */}
      {showApplyModal && selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl max-w-2xl w-full p-6 text-[#1F2937] space-y-5 max-h-[92vh] overflow-y-auto shadow-2xl">
            <div className="flex items-start justify-between border-b border-[#E2E8F0] pb-3">
              <div>
                <h3 className="text-lg font-bold text-[#111827] flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#EA580C]" />
                  Application for {selectedJob.title}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Gym: <span className="text-[#EA580C] font-semibold">{selectedJob.gymName}</span> •{' '}
                  {selectedJob.location}
                </p>
              </div>
              <button
                onClick={() => setShowApplyModal(false)}
                className="text-[#64748B] hover:text-[#C2410C] p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitApplication} className="space-y-4 text-xs">
              {/* Personal Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-700 font-medium block mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl text-[#111827] focus:outline-none focus:border-[#FDBA74]"
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-medium block mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl text-[#111827] focus:outline-none focus:border-[#FDBA74]"
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-medium block mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl text-[#111827] focus:outline-none focus:border-[#FDBA74]"
                  />
                </div>
              </div>

              {/* Experience & Salary Expectations */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-700 font-medium block mb-1">Experience (Years) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={form.yearsOfExperience}
                    onChange={(e) => setForm({ ...form, yearsOfExperience: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl text-[#111827] focus:outline-none focus:border-[#FDBA74]"
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-medium block mb-1">Expected Salary (₹)</label>
                  <input
                    type="text"
                    placeholder="e.g. ₹40,000 / month"
                    value={form.expectedSalary}
                    onChange={(e) => setForm({ ...form, expectedSalary: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl text-[#111827] focus:outline-none focus:border-[#FDBA74]"
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-medium block mb-1">Notice / Availability</label>
                  <select
                    value={form.availability}
                    onChange={(e) => setForm({ ...form, availability: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl text-[#111827] focus:outline-none focus:border-[#FDBA74]"
                  >
                    <option value="Immediate">Immediate Joining</option>
                    <option value="15 Days">Within 15 Days</option>
                    <option value="1 Month">1 Month Notice</option>
                  </select>
                </div>
              </div>

              {/* Specializations & Certifications */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-medium block mb-1">
                    Specializations / Expertise (comma-separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Strength Training, Crossfit, Functional Fitness"
                    value={form.expertise}
                    onChange={(e) => setForm({ ...form, expertise: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl text-[#111827] focus:outline-none focus:border-[#FDBA74]"
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-medium block mb-1">
                    Certifications (comma-separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ACE CPT, CPR/AED, ISSA"
                    value={form.certifications}
                    onChange={(e) => setForm({ ...form, certifications: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl text-[#111827] focus:outline-none focus:border-[#FDBA74]"
                  />
                </div>
              </div>

              {/* Qualifications */}
              <div>
                <label className="text-slate-700 font-medium block mb-1">
                  Academic / Sports Qualifications (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. B.P.Ed, Sports Nutrition Diploma"
                  value={form.qualifications}
                  onChange={(e) => setForm({ ...form, qualifications: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl text-[#111827] focus:outline-none focus:border-[#FDBA74]"
                />
              </div>

              {/* Resume File Upload */}
              <div className="bg-[#FFFFFF] p-4 rounded-xl border border-dashed border-[#FFEDD5]">
                <label className="text-[#111827] font-semibold block mb-1 flex items-center gap-2">
                  <Upload className="w-4 h-4 text-[#EA580C]" />
                  Upload Resume / Credentials (PDF, DOC, DOCX up to 10MB) *
                </label>
                <input
                  type="file"
                  required
                  accept=".pdf,.doc,.docx,image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setResumeFile(e.target.files[0]);
                    }
                  }}
                  className="w-full text-slate-700 text-xs file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#C2410C] file:text-white hover:file:bg-[#9A3412] cursor-pointer"
                />
                {resumeFile && (
                  <p className="text-[#EA580C] text-[11px] mt-1 font-medium">
                    Selected: {resumeFile.name} ({(resumeFile.size / 1024).toFixed(1)} KB)
                  </p>
                )}
              </div>

              {/* Cover Note */}
              <div>
                <label className="text-slate-700 font-medium block mb-1">
                  Personal Pitch / Cover Note (Optional)
                </label>
                <textarea
                  rows={3}
                  value={form.coverLetter}
                  onChange={(e) => setForm({ ...form, coverLetter: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl text-[#111827] focus:outline-none focus:border-[#FDBA74] resize-none"
                />
              </div>

              <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="px-4 py-2 bg-[#FFFFFF] hover:bg-[#FFF7ED] text-slate-700 hover:text-[#C2410C] rounded-xl border border-[#E2E8F0] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-[#C2410C] hover:bg-[#9A3412] text-white font-semibold rounded-xl flex items-center gap-1.5 shadow-md shadow-orange-500/15"
                >
                  {submitting ? 'Submitting Application...' : 'Confirm & Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
