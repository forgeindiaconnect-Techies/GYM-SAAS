import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../../contexts/AuthContext';
import {
  Search,
  Filter,
  MapPin,
  Briefcase,
  IndianRupee,
  Clock,
  Calendar,
  Building2,
  CheckCircle,
  FileText,
  Upload,
  X,
  ExternalLink,
  ChevronRight,
  Sparkles,
  AlertCircle
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
  hasApplied?: boolean;
}

export default function TrainerFindJobs() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Vacancy[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [employmentFilter, setEmploymentFilter] = useState('');
  const [expertiseFilter, setExpertiseFilter] = useState('');

  // Selected job for detail view & application modal
  const [selectedJob, setSelectedJob] = useState<Vacancy | null>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [appliedJobs, setAppliedJobs] = useState<string[]>([]);

  // Application Form State
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
        <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
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
          <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
            {lines.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        );
      }
      return <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">{trimmed}</p>;
    }
    return null;
  };

  useEffect(() => {
    fetchJobs();
    fetchMyApplications();
  }, [locationFilter, employmentFilter, expertiseFilter]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (locationFilter) params.location = locationFilter;
      if (employmentFilter) params.employmentType = employmentFilter;
      if (expertiseFilter) params.expertise = expertiseFilter;
      if (search) params.search = search;

      const res = await axios.get('http://localhost:5600/api/hiring/jobs', { params });
      if (res.data.success) {
        setJobs(res.data.data || res.data.jobs || []);
      }
    } catch (err) {
      console.error('Failed to load vacancies:', err);
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
      console.error('Failed to fetch existing applications:', err);
    }
  };

  const openApplyModal = (job: Vacancy) => {
    const deadline = job.applicationDeadline || (job as any).deadline;
    if (isDeadlineCompleted(deadline)) {
      alert('This job vacancy is over because the application deadline has completed.');
      return;
    }
    setSelectedJob(job);
    setForm({
      fullName: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '',
      email: user?.email || '',
      phone: user?.phone || '',
      yearsOfExperience: '2',
      qualifications: 'B.Sc. Sports Science / ACE Certified',
      certifications: 'CPR/AED, ISSA Fitness Trainer',
      expertise: job.expertise?.join(', ') || 'Strength Training, HIIT',
      expectedSalary: job.salaryMin ? `₹${job.salaryMin.toLocaleString()}` : '',
      preferredLocation: job.location,
      employmentPreference: job.employmentType,
      availability: 'Immediate',
      coverLetter: `I am thrilled to apply for the ${job.title} role at ${job.gymName}. With my dedicated fitness coaching background, I look forward to elevating your gym members' performance.`
    });
    setShowApplyModal(true);
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;

    if (!resumeFile) {
      alert('Please select and upload your resume document (PDF, DOC, or DOCX).');
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
        alert('Application submitted successfully! The Gym Owner has been notified.');
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#111827] flex items-center gap-2">
            <Search className="w-7 h-7 text-[#EA580C]" />
            Trainers Careers
          </h1>
          <p className="text-sm text-[#64748B] mt-1">
            Explore verified trainer openings across premier fitness clubs & health centers
          </p>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-[#FFFFFF] p-4 rounded-2xl border border-[#E2E8F0] flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by job title, gym name, specialization..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchJobs()}
            className="w-full pl-10 pr-4 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#111827] placeholder:text-slate-400 text-sm focus:outline-none focus:border-[#FDBA74]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <input
            type="text"
            placeholder="Location filter..."
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#111827] placeholder:text-slate-400 text-sm focus:outline-none focus:border-[#FDBA74] w-36"
          />

          <select
            value={employmentFilter}
            onChange={(e) => setEmploymentFilter(e.target.value)}
            className="px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#111827] text-sm focus:outline-none focus:border-[#FDBA74]"
          >
            <option value="">All Employment</option>
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Contract">Contract</option>
          </select>
        </div>
      </div>

      {/* Jobs Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0]">
          <div className="inline-block animate-spin w-8 h-8 border-4 border-[#FDBA74] border-t-transparent rounded-full mb-3" />
          <p>Discovering gym vacancies...</p>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="p-12 text-center bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0]">
          <Briefcase className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-[#111827] mb-1">No vacancies found</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Try adjusting your search keywords or filter settings.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredJobs.map((job) => {
            const isApplied = appliedJobs.includes(job._id);
            const deadline = job.applicationDeadline || (job as any).deadline;
            const isOver = isDeadlineCompleted(deadline);

            return (
              <div
                key={job._id}
                className="bg-[#FFFFFF] border border-[#E2E8F0] hover:border-[#FFEDD5] rounded-2xl p-5 transition-all flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="text-xs text-[#EA580C] font-semibold flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        {job.gymName}
                      </span>
                      <h3 className="text-lg font-bold text-[#111827] group-hover:text-[#EA580C] transition-colors mt-0.5">
                        {job.title}
                      </h3>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[11px] bg-[#FFF7ED] text-[#C2410C] px-2.5 py-0.5 rounded-full border border-[#FFEDD5] whitespace-nowrap font-bold">
                        {job.employmentType}
                      </span>
                      {isOver && (
                        <span className="text-[10px] bg-red-500/15 text-[#B91C1C] px-2 py-0.5 rounded-full border border-red-500/30 whitespace-nowrap font-bold flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> Job Vacancy Over
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-[#475569] my-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-[#EA580C] shrink-0" />
                      <span className="truncate text-[#334155]">{job.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <IndianRupee className="w-3.5 h-3.5 text-[#EA580C] shrink-0" />
                      <span className="text-[#111827] font-bold font-mono">
                        {job.salaryMin
                          ? `₹${job.salaryMin.toLocaleString()} - ₹${job.salaryMax?.toLocaleString()} / ${job.salaryType}`
                          : 'Competitive / Negotiable'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-[#EA580C] shrink-0" />
                      <span className="text-[#334155]">
                        {job.experience || (job.experienceRequired ? `${job.experienceRequired}+ years experience required` : 'Any experience welcome')}
                      </span>
                    </div>
                    {deadline && (
                      <div className={`flex items-center gap-2 ${isOver ? 'text-[#B91C1C] font-semibold' : 'text-[#334155]'}`}>
                        <Calendar className="w-3.5 h-3.5 text-[#EA580C] shrink-0" />
                        <span>Deadline: {new Date(deadline).toLocaleDateString()} {isOver ? '(Job Vacancy Over)' : ''}</span>
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-[#334155] line-clamp-2 leading-relaxed bg-[#F8FAFC] p-2.5 rounded-xl border border-[#E2E8F0]">
                    {job.description}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-1">
                    {job.expertise?.slice(0, 3).map((exp, i) => (
                      <span
                        key={i}
                        className="text-[10px] bg-[#FFF7ED] text-[#C2410C] font-semibold px-2 py-0.5 rounded-lg border border-[#FFEDD5]"
                      >
                        {exp}
                      </span>
                    ))}
                    {job.expertise?.length > 3 && (
                      <span className="text-[10px] text-[#64748B] font-medium self-center">
                        +{job.expertise.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-between gap-2">
                  <button
                    onClick={() => setSelectedJob(job)}
                    className="px-3.5 py-2 bg-[#FFFFFF] hover:bg-[#FFF7ED] text-[#111827] hover:text-[#C2410C] rounded-xl text-xs font-bold border border-[#E2E8F0] transition-all shadow-xs cursor-pointer"
                  >
                    View Details
                  </button>

                  {isApplied ? (
                    <span className="px-4 py-2 bg-emerald-500/10 text-[#15803D] border border-emerald-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Applied
                    </span>
                  ) : isOver ? (
                    <span className="px-3.5 py-2 bg-red-500/15 text-[#B91C1C] border border-red-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-not-allowed">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Job Vacancy Over
                    </span>
                  ) : (
                    <button
                      onClick={() => openApplyModal(job)}
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

      {/* Job Details Modal */}
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
                  <span className="text-[11px] bg-[#FFFFFF] text-slate-300 px-2.5 py-0.5 rounded-full border border-[#E2E8F0] font-medium">
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
                  <span className="text-[#111827] font-semibold">{selectedJob.location || 'On-site'}</span>
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
                  <span className="text-[#111827] font-semibold">
                    {selectedJob.experience || (selectedJob.experienceRequired ? `${selectedJob.experienceRequired}+ years` : 'Flexible / Any')}
                  </span>
                </div>
              </div>

              <div className="bg-[#FFFFFF] p-3 rounded-xl border border-[#E2E8F0] flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-[#EA580C] shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Application Deadline</span>
                  {selectedJob.applicationDeadline || (selectedJob as any).deadline ? (
                    <span className={`font-semibold ${isDeadlineCompleted(selectedJob.applicationDeadline || (selectedJob as any).deadline) ? 'text-[#B91C1C] font-bold' : 'text-[#111827]'}`}>
                      {new Date(selectedJob.applicationDeadline || (selectedJob as any).deadline).toLocaleDateString()}
                      {isDeadlineCompleted(selectedJob.applicationDeadline || (selectedJob as any).deadline) ? ' (Job Vacancy Over)' : ''}
                    </span>
                  ) : (
                    <span className="text-[#64748B]">Open until filled</span>
                  )}
                </div>
              </div>

              {selectedJob.workingHours && (
                <div className="bg-[#FFFFFF] p-3 rounded-xl border border-[#E2E8F0] flex items-center gap-2.5 sm:col-span-2">
                  <Clock className="w-4 h-4 text-[#EA580C] shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">Shift & Working Hours</span>
                    <span className="text-[#111827] font-semibold">{selectedJob.workingHours}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Job Description */}
            <div>
              <h4 className="text-xs uppercase font-semibold text-[#EA580C] mb-2">
                Job Overview & Description
              </h4>
              <p className="text-sm text-[#334155] leading-relaxed bg-[#FFFFFF] p-4 rounded-xl border border-[#E2E8F0] whitespace-pre-line">
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
                      className="text-xs bg-[#FFF7ED] text-[#C2410C] font-semibold px-3 py-1 rounded-lg border border-[#FFEDD5]"
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
                <span>Job Vacancy Over: The application deadline for this opening has passed.</span>
              </div>
            )}

            {/* Footer Buttons */}
            <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-between">
              <span className="text-xs text-slate-400">
                {selectedJob.vacanciesCount || 1} {Number(selectedJob.vacanciesCount) > 1 ? 'openings available' : 'opening available'}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedJob(null)}
                  className="px-4 py-2 bg-[#FFFFFF] hover:bg-[#FFF7ED] text-slate-300 rounded-xl text-xs font-medium border border-[#E2E8F0]"
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
                    onClick={() => openApplyModal(selectedJob)}
                    className="px-5 py-2 bg-[#C2410C] hover:bg-[#9A3412] text-white font-semibold rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-md shadow-orange-500/15"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Apply for this Job
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Trainer Application Submission Modal */}
      {showApplyModal && selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl max-w-2xl w-full p-6 text-[#1F2937] space-y-5 max-h-[92vh] overflow-y-auto shadow-2xl">
            <div className="flex items-start justify-between border-b border-[#E2E8F0] pb-3">
              <div>
                <h3 className="text-lg font-bold text-[#111827] flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#EA580C]" />
                  Apply for {selectedJob.title}
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
                  <label className="text-[#475569] font-medium block mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl text-[#111827] focus:outline-none focus:border-[#FDBA74]"
                  />
                </div>
                <div>
                  <label className="text-[#475569] font-medium block mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl text-[#111827] focus:outline-none focus:border-[#FDBA74]"
                  />
                </div>
                <div>
                  <label className="text-[#475569] font-medium block mb-1">Phone Number *</label>
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
                  <label className="text-[#475569] font-medium block mb-1">Experience (Years) *</label>
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
                  <label className="text-[#475569] font-medium block mb-1">Expected Salary (₹)</label>
                  <input
                    type="text"
                    placeholder="e.g. ₹40,000 / month"
                    value={form.expectedSalary}
                    onChange={(e) => setForm({ ...form, expectedSalary: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl text-[#111827] placeholder:text-slate-400 focus:outline-none focus:border-[#FDBA74]"
                  />
                </div>
                <div>
                  <label className="text-[#475569] font-medium block mb-1">Notice / Availability</label>
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
                  <label className="text-[#475569] font-medium block mb-1">
                    Specializations / Expertise (comma-separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Strength Training, Crossfit, Functional Fitness"
                    value={form.expertise}
                    onChange={(e) => setForm({ ...form, expertise: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl text-[#111827] placeholder:text-slate-400 focus:outline-none focus:border-[#FDBA74]"
                  />
                </div>
                <div>
                  <label className="text-[#475569] font-medium block mb-1">
                    Certifications (comma-separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ACE CPT, CPR/AED, ISSA"
                    value={form.certifications}
                    onChange={(e) => setForm({ ...form, certifications: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl text-[#111827] placeholder:text-slate-400 focus:outline-none focus:border-[#FDBA74]"
                  />
                </div>
              </div>

              {/* Qualifications */}
              <div>
                <label className="text-[#475569] font-medium block mb-1">
                  Academic / Sports Qualifications (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. B.P.Ed, Sports Nutrition Diploma"
                  value={form.qualifications}
                  onChange={(e) => setForm({ ...form, qualifications: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl text-[#111827] placeholder:text-slate-400 focus:outline-none focus:border-[#FDBA74]"
                />
              </div>

              {/* Resume File Upload */}
              <div className="bg-[#FFFFFF] p-4 rounded-xl border border-dashed border-[#FFEDD5]">
                <label className="text-[#111827] font-semibold block mb-1 flex items-center gap-2">
                  <Upload className="w-4 h-4 text-[#EA580C]" />
                  Upload Resume / CV (PDF, DOC, DOCX up to 10MB) *
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
                  className="w-full text-[#64748B] text-xs file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#C2410C] file:text-white hover:file:bg-[#9A3412] cursor-pointer"
                />
                {resumeFile && (
                  <p className="text-[#EA580C] text-[11px] mt-1 font-medium">
                    Selected: {resumeFile.name} ({(resumeFile.size / 1024).toFixed(1)} KB)
                  </p>
                )}
              </div>

              {/* Cover Note */}
              <div>
                <label className="text-[#475569] font-medium block mb-1">
                  Personal Pitch / Cover Letter (Optional)
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
                  className="px-4 py-2 bg-[#FFFFFF] hover:bg-[#FFF7ED] text-slate-300 rounded-xl"
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
