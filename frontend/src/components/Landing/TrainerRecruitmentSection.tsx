import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Briefcase,
  UserCheck,
  Search,
  MapPin,
  Calendar,
  Sparkles,
  Building2,
  ArrowRight,
  X,
  Award,
  GraduationCap,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import api from '../../utils/api';

interface JobVacancy {
  _id: string;
  title: string;
  gymName?: string;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryRange?: string;
  salaryType?: string;
  isSalaryNegotiable?: boolean;
  requiredExperience?: string | number;
  experience?: string;
  employmentType: string;
  createdAt: string;
  description?: string;
  responsibilities?: any;
  qualifications?: any;
  certifications?: any;
  expertise?: string[];
  skills?: string[];
  status?: string;
  vacanciesCount?: number;
  workingHours?: string;
}

const renderContentList = (val: any) => {
  if (!val) return null;
  if (Array.isArray(val)) {
    const items = val.map(s => String(s).trim()).filter(Boolean);
    if (items.length === 0) return null;
    return (
      <ul className="text-xs text-slate-300 space-y-1.5 list-disc pl-5">
        {items.map((item, idx) => (
          <li key={idx} className="leading-relaxed">{item}</li>
        ))}
      </ul>
    );
  }
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (!trimmed) return null;
    const lines = trimmed.split(/\r?\n|•/).map(s => s.trim().replace(/^[-*]\s*/, '')).filter(Boolean);
    if (lines.length > 1) {
      return (
        <ul className="text-xs text-slate-300 space-y-1.5 list-disc pl-5">
          {lines.map((item, idx) => (
            <li key={idx} className="leading-relaxed">{item}</li>
          ))}
        </ul>
      );
    }
    return <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">{trimmed}</p>;
  }
  return null;
};

const formatSalary = (job: JobVacancy) => {
  if (job.salaryRange) return job.salaryRange;
  if (job.salaryMin && job.salaryMax) {
    return `₹${job.salaryMin.toLocaleString()} - ₹${job.salaryMax.toLocaleString()}${job.salaryType ? ` / ${job.salaryType.toLowerCase()}` : ' / mo'}`;
  }
  if (job.salaryMin) {
    return `₹${job.salaryMin.toLocaleString()}+${job.salaryType ? ` / ${job.salaryType.toLowerCase()}` : ' / mo'}`;
  }
  if (job.isSalaryNegotiable) return 'Negotiable';
  return 'Competitive';
};

const formatExperience = (job: JobVacancy) => {
  const exp = job.requiredExperience || job.experience;
  if (!exp) return '1+ Year';
  if (typeof exp === 'number') return `${exp}+ Years`;
  return String(exp);
};

const FALLBACK_JOBS: JobVacancy[] = [
  {
    _id: 'fb-j1',
    title: 'Head Strength & Conditioning Coach',
    gymName: 'Titan Athletic Club',
    location: 'Indiranagar, Bangalore',
    salaryMin: 55000,
    salaryMax: 75000,
    salaryRange: '₹55,000 - ₹75,000 / month',
    requiredExperience: '4+ Years',
    employmentType: 'Full-time',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    description: 'Looking for an experienced Head Strength Coach to lead athletic group classes and direct our trainer floor operations.',
    responsibilities: [
      'Lead 12 daily small-group functional strength sessions',
      'Conduct biomechanical movement assessments for new gym members',
      'Mentor junior floor trainers and oversee equipment safety'
    ],
    qualifications: ['NSCA CSCS or ACE-CPT', 'Degree in Exercise Science preferred', '4+ years coaching experience'],
    skills: ['Olympic Lifting', 'Periodization', 'Client Management']
  },
  {
    _id: 'fb-j2',
    title: 'Senior Personal Trainer & Nutritionist',
    gymName: 'Pulse Fit & Health Club',
    location: 'Bandra West, Mumbai',
    salaryMin: 45000,
    salaryMax: 65000,
    salaryRange: '₹45,000 - ₹65,000 / month + PT Commission',
    requiredExperience: '3+ Years',
    employmentType: 'Full-time',
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    description: 'Seeking dynamic personal trainers with a passion for 1-on-1 member transformations and customized nutrition consultation.',
    responsibilities: [
      'Deliver 1-on-1 personal training sessions with structured progression',
      'Design comprehensive meal plans based on metabolic profiles',
      'Maintain member retention rate above 85%'
    ],
    qualifications: ['Certified Personal Trainer (ISSA/ACE/K11)', 'Sports Nutrition Certification'],
    skills: ['Nutrition Planning', 'Hypertrophy', 'Customer Service']
  },
  {
    _id: 'fb-j3',
    title: 'Functional Fitness & HIIT Instructor',
    gymName: 'Forge Fitness Labs',
    location: 'Cyber City, Gurugram',
    salaryMin: 35000,
    salaryMax: 48000,
    salaryRange: '₹35,000 - ₹48,000 / month',
    requiredExperience: '2+ Years',
    employmentType: 'Full-time',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    description: 'Energetic group class instructor to host morning and evening high-intensity interval training, kettlebell routines, and bootcamps.',
    responsibilities: [
      'Conduct high-energy HIIT, Tabata, and Kettlebell bootcamps',
      'Create motivating playlists and engaging workout challenges',
      'Assist members with exercise modifications and safe form'
    ],
    qualifications: ['Group Fitness Certification', 'CPR/AED Certified'],
    skills: ['Kettlebell Training', 'Group Coaching', 'Cardio Conditioning']
  }
];

export function TrainerRecruitmentSection() {
  const navigate = useNavigate();

  // Jobs state
  const [showJobs, setShowJobs] = useState(false);
  const [jobs, setJobs] = useState<JobVacancy[]>(FALLBACK_JOBS);
  const [jobSearch, setJobSearch] = useState('');
  const [jobLocation, setJobLocation] = useState('');
  const [jobEmployment, setJobEmployment] = useState('all');
  const [selectedJob, setSelectedJob] = useState<JobVacancy | null>(null);

  // Dynamic location suggestions from available jobs + popular districts
  const availableLocations = Array.from(
    new Set(
      jobs
        .map((j) => j.location?.trim())
        .filter((loc): loc is string => Boolean(loc))
    )
  );

  const commonDistricts = [
    'Bangalore',
    'Chennai',
    'Coimbatore',
    'Hyderabad',
    'Mumbai',
    'Delhi NCR',
    'Gurugram',
    'Pune',
    'Madurai',
    'Salem',
    'Trichy',
    'Tirunelveli',
    'Kolkata',
    'Kochi'
  ];

  const allLocationSuggestions = Array.from(new Set([...availableLocations, ...commonDistricts]));

  useEffect(() => {
    // Fetch Public Jobs
    api
      .get('/hiring/jobs')
      .then((res) => {
        if (res.data?.success && res.data.jobs?.length > 0) {
          setJobs(res.data.jobs);
        }
      })
      .catch((err) => {
        console.warn('Using fallback jobs data on landing page', err);
      });
  }, []);

  // Filter Jobs
  const filteredJobs = jobs.filter((j) => {
    const term = jobSearch.toLowerCase();
    const matchesSearch =
      !term ||
      j.title.toLowerCase().includes(term) ||
      (j.gymName && j.gymName.toLowerCase().includes(term)) ||
      (j.description && j.description.toLowerCase().includes(term));

    const locTerm = (jobLocation === 'all' ? '' : jobLocation).trim().toLowerCase();
    const matchesLocation =
      !locTerm || (j.location && j.location.toLowerCase().includes(locTerm));

    const matchesEmp =
      jobEmployment === 'all' ||
      (j.employmentType && j.employmentType.toLowerCase().includes(jobEmployment.toLowerCase()));

    return matchesSearch && matchesLocation && matchesEmp;
  });

  const handleApplyClick = (job: JobVacancy) => {
    // Open trainer registration & job application flow with job details preloaded
    navigate(`/register/trainer?jobId=${job._id}`);
  };

  return (
    <section className="border-t border-[#E2E8F0] bg-[#FFFFFF] py-24 relative overflow-hidden" id="recruitment-hub">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[#FFF7ED] rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Heading */}
        <div className="text-center max-w-4xl mx-auto mb-12">
          <span className="px-3.5 py-1.5 rounded-full bg-[#FFF7ED] border border-[#FFEDD5] text-[#EA580C] text-xs font-semibold inline-flex items-center gap-1.5 mb-4">
            <Sparkles size={13} />
            <span>Recruitment & Hiring Engine</span>
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#111827] tracking-tight mb-4">
            Trainer Recruitment & Gym Careers
          </h2>
          <p className="text-sm sm:text-base text-[#64748B] leading-relaxed max-w-3xl mx-auto">
            Discover verified personal trainers, functional coaches, and group instructors—or browse active coaching vacancies published by top fitness centers nationwide.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
            {/* 1. I'm Looking to Join a Gym */}
            <Link
              to="/gyms"
              onClick={() => window.scrollTo(0, 0)}
              className="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 bg-[#C2410C] hover:bg-[#9A3412] text-white shadow-lg shadow-orange-500/15 hover:scale-[1.02]"
            >
              <UserCheck size={16} />
              <span>I'm Looking to Join a Gym</span>
            </Link>

            {/* 2. I'm a Fitness Trainer Looking for a Job */}
            <button
              onClick={() => {
                setShowJobs((prev) => {
                  const next = !prev;
                  if (!prev) {
                    setTimeout(() => {
                      const el = document.getElementById('recruitment-hub-content');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }
                  return next;
                });
              }}
              className="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 bg-[#C2410C] hover:bg-[#9A3412] text-white shadow-lg shadow-orange-500/15 hover:scale-[1.02]"
            >
              <Briefcase size={16} />
              <span>I'm a Fitness Trainer Looking for a Job</span>
              {showJobs ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </button>

            {/* 3. Own a Gym */}
            <Link
              to="/portal/gym-owner"
              onClick={() => window.scrollTo(0, 0)}
              className="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 bg-[#C2410C] hover:bg-[#9A3412] text-white shadow-lg shadow-orange-500/15 hover:scale-[1.02]"
            >
              <Building2 size={16} />
              <span>Own a Gym</span>
              <span className="text-[9px] bg-black/20 text-black px-1.5 py-0.5 rounded font-black tracking-wider uppercase border border-black/25">
                Owner
              </span>
            </Link>
          </div>
        </div>

        {/* Vacancies are only displayed when "I'm a Fitness Trainer Looking for a Job" is clicked */}
        {showJobs && (
          <div id="recruitment-hub-content" className="space-y-6 animate-fadeIn mt-8">


            {/* Filter Bar */}
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
              <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
                <div className="relative w-full md:w-96">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by job title, gym name, or keywords..."
                    value={jobSearch}
                    onChange={(e) => setJobSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-[#FDBA74]"
                  />
                </div>

                <div className="flex items-center gap-2 self-start md:self-auto text-xs text-slate-400">
                  <span className="font-semibold text-white font-mono">{filteredJobs.length}</span> active vacancies
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#E2E8F0]/60">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Location / District
                    </label>
                    {jobLocation && (
                      <button
                        type="button"
                        onClick={() => setJobLocation('')}
                        className="text-[10px] text-[#EA580C] hover:underline"
                      >
                        Reset to All
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      list="job-locations-list"
                      placeholder="Type district or city (e.g. Chennai, Bangalore)..."
                      value={jobLocation}
                      onChange={(e) => setJobLocation(e.target.value)}
                      className="w-full pl-8 pr-7 py-2 bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl text-white text-xs sm:text-sm focus:border-[#FDBA74] focus:outline-none placeholder-slate-500"
                    />
                    {jobLocation && (
                      <button
                        type="button"
                        onClick={() => setJobLocation('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#C2410C] p-0.5"
                        title="Clear Location"
                      >
                        <X size={13} />
                      </button>
                    )}
                    <datalist id="job-locations-list">
                      {allLocationSuggestions.map((loc, idx) => (
                        <option key={idx} value={loc} />
                      ))}
                    </datalist>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                    Employment Type
                  </label>
                  <select
                    value={jobEmployment}
                    onChange={(e) => setJobEmployment(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl text-white text-xs sm:text-sm focus:border-[#FDBA74] focus:outline-none"
                  >
                    <option value="all">All Types</option>
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="contract">Contract</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Jobs List */}
            {filteredJobs.length === 0 ? (
              <div className="p-16 text-center bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0]">
                <Briefcase className="w-12 h-12 text-[#EA580C]/40 mx-auto mb-3" />
                <h3 className="text-base font-bold text-[#111827] mb-1">
                  {jobLocation
                    ? `No vacancies found in "${jobLocation}"`
                    : 'No vacancies found matching your search'}
                </h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
                  Check back soon as new gym coaching roles are posted regularly by verified gym owners.
                </p>
                <button
                  onClick={() => {
                    setJobSearch('');
                    setJobLocation('');
                    setJobEmployment('all');
                  }}
                  className="px-4 py-2 bg-[#FFFFFF] text-slate-300 text-xs font-semibold rounded-xl border border-[#E2E8F0] hover:text-[#C2410C] hover:border-[#FDBA74] transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredJobs.map((job) => (
                  <div
                    key={job._id}
                    className="bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#FFEDD5] rounded-2xl p-5 sm:p-6 transition-all flex flex-col md:flex-row md:items-center justify-between gap-5 group"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h3 className="text-base sm:text-lg font-bold text-[#111827] group-hover:text-[#EA580C] transition-colors">
                          {job.title}
                        </h3>
                        <span className="px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/30 text-[10px] font-bold uppercase tracking-wider">
                          {job.employmentType}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
                        <span className="font-semibold text-white flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-[#EA580C]" />
                          {job.gymName || 'Premier Fitness Club'}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-500" />
                          {job.location || 'Bangalore'}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          {new Date(job.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-300 pt-1">
                        <span className="px-2 py-0.5 bg-[#FFFFFF] border border-[#E2E8F0] rounded-md text-[#EA580C] font-mono font-bold">
                          {formatSalary(job)}
                        </span>
                        <span className="px-2 py-0.5 bg-[#FFFFFF] border border-[#E2E8F0] rounded-md text-slate-300">
                          Exp: {formatExperience(job)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      <button
                        onClick={() => setSelectedJob(job)}
                        className="px-4 py-2 bg-[#FFFFFF] hover:bg-[#FFF7ED] text-slate-300 hover:text-[#C2410C] rounded-xl text-xs font-semibold border border-[#E2E8F0] transition-all"
                      >
                        View Vacancy Details
                      </button>

                      <button
                        onClick={() => handleApplyClick(job)}
                        className="px-5 py-2 bg-[#C2410C] hover:bg-[#9A3412] text-white font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-md shadow-orange-500/15"
                      >
                        <Briefcase className="w-3.5 h-3.5" />
                        Apply Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* PUBLIC JOB VACANCY MODAL */}
      {/* ========================================================================= */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl max-w-2xl w-full p-6 text-[#1F2937] shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-5">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-[#E2E8F0] gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h3 className="text-xl font-bold text-[#111827]">{selectedJob.title}</h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/30 text-[10px] font-bold uppercase tracking-wider">
                    {selectedJob.employmentType}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
                  <span className="font-semibold text-white flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-[#EA580C]" />
                    {selectedJob.gymName || 'Premier Fitness Club'}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    {selectedJob.location || 'Bangalore'}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    {new Date(selectedJob.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedJob(null)}
                className="text-[#64748B] hover:text-[#C2410C] p-1 rounded-lg hover:bg-[#FFFFFF] transition-colors shrink-0"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-[#FFFFFF] p-4 rounded-xl border border-[#E2E8F0] text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                  Offered Compensation
                </span>
                <span className="font-bold text-[#EA580C] text-sm mt-0.5 block font-mono">
                  {formatSalary(selectedJob)}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                  Employment Type
                </span>
                <span className="font-semibold text-white mt-0.5 block">
                  {selectedJob.employmentType}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                  Experience Required
                </span>
                <span className="font-semibold text-white mt-0.5 block">
                  {formatExperience(selectedJob)}
                </span>
              </div>
            </div>

            {/* Specialization / Expertise Tags */}
            {selectedJob.expertise && selectedJob.expertise.length > 0 && (
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1.5">
                  Focus Specializations
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedJob.expertise.map((exp, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-[#FFFFFF] border border-[#E2E8F0] text-[11px] text-[#EA580C] font-medium"
                    >
                      {exp}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Job Description */}
            {selectedJob.description && (
              <div>
                <h4 className="font-bold text-slate-300 uppercase text-[10px] tracking-wider mb-1.5">
                  Job Description
                </h4>
                <div className="bg-[#FFFFFF] p-3.5 rounded-xl border border-[#E2E8F0] text-slate-300 text-xs leading-relaxed whitespace-pre-line">
                  {selectedJob.description}
                </div>
              </div>
            )}

            {/* Key Responsibilities */}
            {Boolean(selectedJob.responsibilities) && (
              <div>
                <h4 className="font-bold text-slate-300 uppercase text-[10px] tracking-wider mb-1.5">
                  Key Responsibilities
                </h4>
                <div className="bg-[#FFFFFF] p-3.5 rounded-xl border border-[#E2E8F0]">
                  {renderContentList(selectedJob.responsibilities)}
                </div>
              </div>
            )}

            {/* Qualifications */}
            {Boolean(selectedJob.qualifications) && (
              <div>
                <h4 className="font-bold text-slate-300 uppercase text-[10px] tracking-wider mb-1.5">
                  Qualifications & Requirements
                </h4>
                <div className="bg-[#FFFFFF] p-3.5 rounded-xl border border-[#E2E8F0]">
                  {renderContentList(selectedJob.qualifications)}
                </div>
              </div>
            )}

            {/* Certifications */}
            {Boolean(selectedJob.certifications) && (
              <div>
                <h4 className="font-bold text-slate-300 uppercase text-[10px] tracking-wider mb-1.5">
                  Certifications
                </h4>
                <div className="bg-[#FFFFFF] p-3.5 rounded-xl border border-[#E2E8F0]">
                  {renderContentList(selectedJob.certifications)}
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E2E8F0]">
              <button
                onClick={() => setSelectedJob(null)}
                className="px-4 py-2 bg-[#FFFFFF] text-slate-300 rounded-xl text-xs font-semibold hover:bg-[#FFF7ED] transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const j = selectedJob;
                  setSelectedJob(null);
                  handleApplyClick(j);
                }}
                className="px-5 py-2.5 bg-[#C2410C] hover:bg-[#9A3412] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-orange-500/15 transition-all hover:scale-[1.02]"
              >
                <Briefcase className="w-4 h-4" />
                Apply for this Vacancy
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
