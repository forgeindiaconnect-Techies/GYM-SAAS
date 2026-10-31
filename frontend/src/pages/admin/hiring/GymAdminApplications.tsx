import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import {
  Users,
  Search,
  Filter,
  Eye,
  FileText,
  Calendar,
  Gift,
  CheckCircle,
  XCircle,
  Clock,
  Briefcase,
  MapPin,
  DollarSign,
  Phone,
  Mail,
  Award,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  X
} from 'lucide-react';

interface Application {
  _id: string;
  jobId: {
    _id: string;
    title: string;
    employmentType: string;
    location: string;
  };
  fullName?: string;
  name?: string;
  email: string;
  phone: string;
  yearsOfExperience?: number | string;
  workExperience?: string;
  qualifications?: string[] | string;
  certifications?: string[] | string;
  expertise?: string[] | string;
  expectedSalary?: string;
  preferredLocation?: string;
  city?: string;
  employmentPreference?: string;
  trainingMode?: string;
  availability?: string;
  previousGym?: string;
  coverLetter?: string;
  resumeUrl?: string;
  certificationUrl?: string;
  profilePhoto?: string;
  status: string;
  createdAt: string;
}

const parseList = (val: any): string[] => {
  if (!val) return [];
  if (Array.isArray(val)) return val.filter(Boolean);
  if (typeof val === 'string') {
    return val.split(',').map((s) => s.trim()).filter(Boolean);
  }
  return [];
};

const formatExp = (workExp?: string, yearsExp?: number | string): string => {
  if (workExp && String(workExp).trim()) {
    const trimmed = String(workExp).trim();
    if (trimmed.toLowerCase().includes('year') || trimmed.toLowerCase().includes('fresher')) {
      return trimmed;
    }
    return `${trimmed} Years`;
  }
  if (yearsExp !== undefined && yearsExp !== null && String(yearsExp).trim() !== '') {
    const s = String(yearsExp).trim();
    if (s.toLowerCase().includes('year') || s.toLowerCase().includes('fresher')) {
      return s;
    }
    return `${s} Years`;
  }
  return '1–2 Years';
};

export default function GymAdminApplications() {
  const [searchParams] = useSearchParams();
  const initialJobId = searchParams.get('jobId') || '';

  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [jobFilter, setJobFilter] = useState(initialJobId);
  const [jobsList, setJobsList] = useState<{ _id: string; title: string }[]>([]);

  // Modals state
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null);

  // Interview form state
  const [interviewForm, setInterviewForm] = useState({
    date: '',
    time: '',
    duration: '30 mins',
    mode: 'Online',
    locationOrLink: '',
    instructions: ''
  });

  // Offer form state
  const [offerForm, setOfferForm] = useState({
    offeredSalary: '',
    salaryPeriod: 'Month',
    employmentType: 'Full-time',
    joiningDate: '',
    terms: ''
  });

  useEffect(() => {
    fetchApplications();
    fetchJobsList();
  }, [statusFilter, jobFilter]);

  const fetchJobsList = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('aigym_token');
      const res = await axios.get('http://localhost:5600/api/hiring/admin/jobs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        const jobs = res.data.jobs || res.data.data || [];
        setJobsList(jobs.map((j: any) => ({ _id: j._id, title: j.title })));
      }
    } catch (err) {
      console.error('Failed to load jobs list:', err);
    }
  };

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('aigym_token');
      const params: any = {};
      if (statusFilter) params.status = statusFilter;
      if (jobFilter) params.jobId = jobFilter;

      const res = await axios.get('http://localhost:5600/api/hiring/admin/applications', {
        headers: { Authorization: `Bearer ${token}` },
        params
      });
      if (res.data.success) {
        setApplications(res.data.applications || res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (appId: string, newStatus: string, notes?: string) => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('aigym_token');
      const res = await axios.patch(
        `http://localhost:5600/api/hiring/admin/applications/${appId}/status`,
        { status: newStatus, notes },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setApplications((prev) =>
          prev.map((a) => (a._id === appId ? { ...a, status: newStatus } : a))
        );
        if (selectedApp && selectedApp._id === appId) {
          setSelectedApp({ ...selectedApp, status: newStatus });
        }
        const appObj = applications.find((a) => a._id === appId);
        const emailMsg = appObj?.email ? ` & email sent directly to ${appObj.email}` : '';
        setStatusFeedback(
          res.data.message || `Candidate status updated to "${newStatus}"${emailMsg}`
        );
        setTimeout(() => setStatusFeedback(null), 6000);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleScheduleInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('aigym_token');
      const res = await axios.post(
        'http://localhost:5600/api/hiring/admin/interviews',
        {
          applicationId: selectedApp._id,
          ...interviewForm
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        alert('Interview scheduled successfully & trainer notified!');
        setShowInterviewModal(false);
        fetchApplications();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to schedule interview');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('aigym_token');
      const res = await axios.post(
        'http://localhost:5600/api/hiring/admin/offers',
        {
          applicationId: selectedApp._id,
          ...offerForm
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        alert('Formal job offer dispatched! Candidate notified.');
        setShowOfferModal(false);
        fetchApplications();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to send job offer');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredApps = applications.filter((app) => {
    const term = search.toLowerCase();
    const candidateName = app.fullName || (app as any).name || '';
    return (
      candidateName.toLowerCase().includes(term) ||
      app.email?.toLowerCase().includes(term) ||
      app.jobId?.title?.toLowerCase().includes(term) ||
      parseList(app.expertise).some((e: string) => e.toLowerCase().includes(term))
    );
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Applied':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Under Review':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Shortlisted':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Interview Scheduled':
        return 'bg-cyan-50 text-cyan-800 border-cyan-200';
      case 'Selected':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Offer Accepted':
        return 'bg-teal-50 text-teal-800 border-teal-200';
      case 'Rejected':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'Withdrawn':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#111827] flex items-center gap-2">
            <Users className="w-7 h-7 text-[#EA580C]" />
            Trainer Applications
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Review candidate resumes, shortlist elite fitness experts, schedule interviews and extend offers
          </p>
        </div>
      </div>

      {/* Status Feedback Banner */}
      {statusFeedback && (
        <div className="bg-[#FFF7ED] border border-[#FFEDD5] text-[#EA580C] px-4 py-3 rounded-xl flex items-center justify-between text-sm shadow-lg shadow-orange-500/15">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0 text-[#EA580C]" />
            <span className="font-medium">{statusFeedback}</span>
          </div>
          <button
            onClick={() => setStatusFeedback(null)}
            className="text-[#EA580C]/70 hover:text-[#EA580C] p-1 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter / Search Bar */}
      <div className="bg-[#FFFFFF] p-4 rounded-2xl border border-[#E2E8F0] flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search candidates by name, email, job title, expertise..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#111827] placeholder:text-slate-400 text-sm focus:outline-none focus:border-[#FDBA74]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#111827] text-sm focus:outline-none focus:border-[#FDBA74] font-medium"
          >
            <option value="">All Statuses</option>
            <option value="Applied">Applied</option>
            <option value="Under Review">Under Review</option>
            <option value="Shortlisted">Shortlisted</option>
            <option value="Interview Scheduled">Interview Scheduled</option>
            <option value="Selected">Selected</option>
            <option value="Offer Accepted">Offer Accepted</option>
            <option value="Rejected">Rejected</option>
            <option value="Withdrawn">Withdrawn</option>
          </select>
        </div>
      </div>

      {/* Applications Table / Cards */}
      {loading ? (
        <div className="p-12 text-center text-[#64748B] bg-[#FFFFFF] rounded-2xl border border-[#E2E8F0]">
          <div className="inline-block animate-spin w-8 h-8 border-4 border-[#FDBA74] border-t-transparent rounded-full mb-3" />
          <p>Loading candidate applications...</p>
        </div>
      ) : filteredApps.length === 0 ? (
        <div className="p-12 text-center bg-[#FFFFFF] rounded-2xl border border-[#E2E8F0]">
          <Users className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-[#111827] mb-1">No applications found</h3>
          <p className="text-sm text-[#64748B] max-w-md mx-auto">
            {search || statusFilter || jobFilter
              ? 'No candidate applications match your filter criteria.'
              : 'You do not have any applications submitted yet. Ensure your vacancies are published on the Careers portal.'}
          </p>
        </div>
      ) : (
        <div className="bg-[#FFFFFF] rounded-2xl border border-[#E2E8F0] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-[#334155]">
              <thead className="bg-[#F8FAFC] text-xs uppercase text-[#475569] font-bold border-b border-[#E2E8F0]">
                <tr>
                  <th className="px-6 py-4">Candidate</th>
                  <th className="px-6 py-4">Applied Vacancy</th>
                  <th className="px-6 py-4">Experience & Expertise</th>
                  <th className="px-6 py-4">Expected Salary</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {filteredApps.map((app) => (
                  <tr key={app._id} className="hover:bg-[#FFF7ED]/30 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-bold text-[#111827] flex items-center gap-2">
                          {app.fullName || (app as any).name}
                          {app.resumeUrl && (
                            <a
                              href={`http://localhost:5600${app.resumeUrl}`}
                              target="_blank"
                              rel="noreferrer"
                              title="Download / View Resume"
                              className="text-[#EA580C] hover:text-[#9A3412]"
                            >
                              <FileText className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                        <div className="text-xs text-[#64748B] mt-0.5 flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3 text-[#EA580C]" />
                            {app.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-[#EA580C]" />
                            {app.phone}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="font-bold text-[#111827]">
                        {app.jobId?.title || 'Gym Trainer'}
                      </div>
                      <div className="text-xs text-[#64748B]">
                        {app.jobId?.employmentType} • {app.jobId?.location}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-xs text-[#111827] font-bold">
                        {formatExp(app.workExperience, app.yearsOfExperience)}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {parseList(app.expertise).slice(0, 2).map((exp, i) => (
                          <span
                            key={i}
                            className="text-[10px] bg-[#FFF7ED] text-[#C2410C] font-semibold px-2 py-0.5 rounded border border-[#FFEDD5]"
                          >
                            {exp}
                          </span>
                        ))}
                        {parseList(app.expertise).length > 2 && (
                          <span className="text-[10px] text-[#64748B] font-medium">
                            +{parseList(app.expertise).length - 2}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4 font-mono text-xs text-[#111827] font-bold">
                      {app.expectedSalary || 'Negotiable'}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(
                          app.status
                        )}`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {app.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedApp(app)}
                          className="px-2.5 py-1.5 bg-[#FFFFFF] hover:bg-[#FFF7ED] border border-[#E2E8F0] rounded-lg text-[#111827] hover:text-[#C2410C] font-semibold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#EA580C]" />
                          Review
                        </button>

                        {/* Status Action Dropdown */}
                        <div className="relative inline-block">
                          <select
                            disabled={actionLoading}
                            value=""
                            onChange={(e) => {
                              if (e.target.value) {
                                handleStatusChange(app._id, e.target.value);
                              }
                            }}
                            className="appearance-none pl-2.5 pr-7 py-1.5 bg-[#FFFFFF] hover:bg-[#FFF7ED] border border-[#E2E8F0] hover:border-[#FFEDD5] rounded-lg text-[#111827] hover:text-[#C2410C] text-xs font-semibold cursor-pointer transition-all focus:outline-none focus:border-[#FDBA74] shadow-xs"
                            title="Update candidate status"
                          >
                            <option value="" disabled className="bg-[#F8FAFC] text-slate-400">
                              Action ▾
                            </option>
                            <option
                              value="Shortlisted"
                              disabled={app.status === 'Shortlisted'}
                              className="bg-[#F8FAFC] text-purple-400 py-1"
                            >
                              Shortlist {app.status === 'Shortlisted' ? '(Current)' : ''}
                            </option>
                            <option
                              value="Under Review"
                              disabled={app.status === 'Under Review'}
                              className="bg-[#F8FAFC] text-[#B45309] py-1"
                            >
                              Mark Under Review {app.status === 'Under Review' ? '(Current)' : ''}
                            </option>
                            <option
                              value="Rejected"
                              disabled={app.status === 'Rejected'}
                              className="bg-[#F8FAFC] text-[#B91C1C] py-1"
                            >
                              Reject {app.status === 'Rejected' ? '(Current)' : ''}
                            </option>
                          </select>
                          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Candidate Profile / Detailed Review Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl max-w-2xl w-full p-6 text-[#1F2937] space-y-5 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-start justify-between border-b border-[#E2E8F0] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#FFF7ED] text-[#EA580C] border border-[#FFEDD5] flex items-center justify-center font-bold text-lg overflow-hidden shrink-0">
                  {selectedApp.profilePhoto ? (
                    <img
                      src={
                        selectedApp.profilePhoto.startsWith('http')
                          ? selectedApp.profilePhoto
                          : `http://localhost:5600${selectedApp.profilePhoto}`
                      }
                      alt={selectedApp.fullName || (selectedApp as any).name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    (selectedApp.fullName || (selectedApp as any).name || 'T')
                      .charAt(0)
                      .toUpperCase()
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    {selectedApp.fullName || (selectedApp as any).name || 'Trainer Candidate'}
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full border ${getStatusBadge(
                        selectedApp.status
                      )}`}
                    >
                      {selectedApp.status}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Applied for:{' '}
                    <span className="text-[#EA580C]">
                      {selectedApp.jobId?.title || 'Gym Trainer Position'}
                    </span>{' '}
                    •{' '}
                    {selectedApp.createdAt
                      ? new Date(selectedApp.createdAt).toLocaleDateString()
                      : 'Recent'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="text-[#64748B] hover:text-[#C2410C] p-1 rounded-lg hover:bg-[#FFFFFF]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contact & Basics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-[#FFFFFF] p-4 rounded-xl border border-[#E2E8F0] text-xs">
              <div>
                <span className="text-slate-500 block">Phone</span>
                <span className="font-semibold text-[#111827]">
                  {selectedApp.phone
                    ? `+91 ${selectedApp.phone.replace(/^\+?91/, '').trim()}`
                    : 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Email</span>
                <span className="font-semibold text-[#111827] truncate block" title={selectedApp.email}>
                  {selectedApp.email}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Experience</span>
                <span className="font-semibold text-[#111827]">
                  {formatExp(selectedApp.workExperience, selectedApp.yearsOfExperience)}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Expected Salary</span>
                <span className="font-semibold text-[#EA580C] font-mono">
                  {selectedApp.expectedSalary || 'Negotiable'}
                </span>
              </div>
            </div>

            {/* Additional Candidate Info Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-[#FFFFFF]/70 p-4 rounded-xl border border-[#E2E8F0] text-xs">
              <div>
                <span className="text-slate-500 block">Preferred Location</span>
                <span className="font-semibold text-[#111827]">
                  {selectedApp.preferredLocation || (selectedApp as any).city || 'Bangalore'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Availability</span>
                <span className="font-semibold text-[#111827]">
                  {selectedApp.availability || 'Immediately'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Training Mode</span>
                <span className="font-semibold text-[#EA580C]">
                  {selectedApp.employmentPreference || (selectedApp as any).trainingMode || 'Both (Hybrid)'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Previous Gym / Employer</span>
                <span className="font-semibold text-[#111827] truncate block">
                  {(selectedApp as any).previousGym || 'Fresher / Independent'}
                </span>
              </div>
            </div>

            {/* Expertise & Skills */}
            <div>
              <h4 className="text-xs uppercase font-semibold text-[#64748B] mb-2">
                Specializations & Expertise
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {parseList(selectedApp.expertise).length > 0 ? (
                  parseList(selectedApp.expertise).map((e, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-[#FFF7ED] text-[#C2410C] font-semibold px-2.5 py-1 rounded-lg border border-[#FFEDD5]"
                    >
                      {e}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-500 italic">General Fitness</span>
                )}
              </div>
            </div>

            {/* Certifications & Qualifications */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#FFFFFF] p-3.5 rounded-xl border border-[#E2E8F0]">
                <h4 className="text-xs uppercase font-semibold text-[#EA580C] mb-2 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5" /> Fitness Certifications
                </h4>
                {parseList(selectedApp.certifications).length > 0 ? (
                  <ul className="text-xs text-[#111827] font-medium space-y-1 list-disc list-inside">
                    {parseList(selectedApp.certifications).map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-500 italic">None listed</p>
                )}
              </div>

              <div className="bg-[#FFFFFF] p-3.5 rounded-xl border border-[#E2E8F0]">
                <h4 className="text-xs uppercase font-semibold text-[#EA580C] mb-2 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5" /> Education & Qualifications
                </h4>
                {parseList(selectedApp.qualifications).length > 0 ? (
                  <ul className="text-xs text-[#111827] font-medium space-y-1 list-disc list-inside">
                    {parseList(selectedApp.qualifications).map((q, i) => (
                      <li key={i}>{q}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-500 italic">None listed</p>
                )}
              </div>
            </div>

            {/* Cover Letter */}
            {selectedApp.coverLetter && (
              <div>
                <h4 className="text-xs uppercase font-semibold text-[#64748B] mb-1">
                  Introduction / Cover Note
                </h4>
                <div className="text-xs text-[#334155] bg-[#FFFFFF] p-3.5 rounded-xl border border-[#E2E8F0] leading-relaxed">
                  {selectedApp.coverLetter}
                </div>
              </div>
            )}

            {/* Uploaded Documents */}
            <div className="space-y-2">
              <h4 className="text-xs uppercase font-semibold text-[#64748B]">
                Uploaded Candidate Documents
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedApp.resumeUrl ? (
                  <div className="flex items-center justify-between bg-[#F8FAFC] p-3.5 rounded-xl border border-[#FFEDD5]">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-[#EA580C]" />
                      <div>
                        <span className="text-xs font-semibold text-[#111827] block">
                          Resume / CV
                        </span>
                        <span className="text-[11px] text-[#64748B]">
                          Verified candidate document
                        </span>
                      </div>
                    </div>
                    <a
                      href={
                        selectedApp.resumeUrl.startsWith('http')
                          ? selectedApp.resumeUrl
                          : `http://localhost:5600${selectedApp.resumeUrl}`
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-[#C2410C] hover:bg-[#9A3412] text-white font-semibold text-xs rounded-lg transition-all flex items-center gap-1.5"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Open Resume
                    </a>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 bg-[#FFFFFF] p-3.5 rounded-xl border border-[#E2E8F0] text-slate-500 text-xs">
                    <FileText className="w-5 h-5" />
                    <span>No resume attached</span>
                  </div>
                )}

                {(selectedApp as any).certificationUrl ? (
                  <div className="flex items-center justify-between bg-[#F8FAFC] p-3.5 rounded-xl border border-[#FFEDD5]">
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-[#EA580C]" />
                      <div>
                        <span className="text-xs font-semibold text-[#111827] block">
                          Certification File
                        </span>
                        <span className="text-[11px] text-[#64748B]">
                          Verified credentials
                        </span>
                      </div>
                    </div>
                    <a
                      href={
                        (selectedApp as any).certificationUrl.startsWith('http')
                          ? (selectedApp as any).certificationUrl
                          : `http://localhost:5600${(selectedApp as any).certificationUrl}`
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-[#C2410C] hover:bg-[#9A3412] text-white font-semibold text-xs rounded-lg transition-all flex items-center gap-1.5"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Open Certificate
                    </a>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-4 border-t border-[#E2E8F0] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  disabled={actionLoading}
                  onClick={() => handleStatusChange(selectedApp._id, 'Under Review')}
                  className="px-3 py-2 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-700 rounded-xl text-xs font-medium transition-all"
                >
                  Mark Under Review
                </button>
                <button
                  disabled={actionLoading}
                  onClick={() => handleStatusChange(selectedApp._id, 'Shortlisted')}
                  className="px-3 py-2 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 rounded-xl text-xs font-medium transition-all"
                >
                  Shortlist
                </button>
                <button
                  disabled={actionLoading}
                  onClick={() => handleStatusChange(selectedApp._id, 'Rejected')}
                  className="px-3 py-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium transition-all"
                >
                  Reject
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowInterviewModal(true)}
                  className="px-3 py-2 bg-cyan-50 hover:bg-cyan-100 border border-cyan-300 text-cyan-700 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  Schedule Interview
                </button>
                <button
                  onClick={() => setShowOfferModal(true)}
                  className="px-3 py-2 bg-[#C2410C] hover:bg-[#9A3412] text-white font-semibold rounded-xl text-xs transition-all flex items-center gap-1.5"
                >
                  <Gift className="w-3.5 h-3.5" />
                  Issue Job Offer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Interview Modal */}
      {showInterviewModal && selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl max-w-md w-full p-6 text-[#1F2937] space-y-4">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h3 className="font-bold text-base flex items-center gap-2 text-cyan-600">
                <Calendar className="w-5 h-5" />
                Schedule Interview: {selectedApp.fullName}
              </h3>
              <button
                onClick={() => setShowInterviewModal(false)}
                className="text-[#64748B] hover:text-[#C2410C]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleScheduleInterview} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#475569] font-medium block mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={interviewForm.date}
                    onChange={(e) => setInterviewForm({ ...interviewForm, date: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl text-[#111827] focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-[#475569] font-medium block mb-1">Time *</label>
                  <input
                    type="time"
                    required
                    value={interviewForm.time}
                    onChange={(e) => setInterviewForm({ ...interviewForm, time: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl text-[#111827] focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#475569] font-medium block mb-1">Mode *</label>
                  <select
                    value={interviewForm.mode}
                    onChange={(e) => setInterviewForm({ ...interviewForm, mode: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl text-[#111827] focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Online">Online (Google Meet / Zoom)</option>
                    <option value="In-Person">In-Person at Gym</option>
                    <option value="Phone">Phone Call</option>
                  </select>
                </div>
                <div>
                  <label className="text-[#475569] font-medium block mb-1">Estimated Duration</label>
                  <input
                    type="text"
                    value={interviewForm.duration}
                    onChange={(e) =>
                      setInterviewForm({ ...interviewForm, duration: e.target.value })
                    }
                    placeholder="e.g. 30 mins"
                    className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl text-[#111827] focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[#475569] font-medium block mb-1">Meeting Link or Location *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. https://meet.google.com/xyz or Gym Floor 2"
                  value={interviewForm.locationOrLink}
                  onChange={(e) =>
                    setInterviewForm({ ...interviewForm, locationOrLink: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl text-[#111827] focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-[#475569] font-medium block mb-1">Instructions for Trainer</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Please bring workout apparel for practical fitness demonstration"
                  value={interviewForm.instructions}
                  onChange={(e) =>
                    setInterviewForm({ ...interviewForm, instructions: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl text-[#111827] focus:outline-none focus:border-cyan-500 resize-none"
                />
              </div>

              <div className="pt-3 border-t border-[#E2E8F0] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowInterviewModal(false)}
                  className="px-3 py-1.5 bg-[#FFFFFF] hover:bg-[#FFF7ED] text-[#64748B] font-semibold border border-[#E2E8F0] rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-xl"
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
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl max-w-md w-full p-6 text-[#1F2937] space-y-4">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h3 className="font-bold text-base flex items-center gap-2 text-[#EA580C]">
                <Gift className="w-5 h-5" />
                Issue Offer: {selectedApp.fullName}
              </h3>
              <button
                onClick={() => setShowOfferModal(false)}
                className="text-[#64748B] hover:text-[#C2410C]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendOffer} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#475569] font-medium block mb-1">Offered Salary (₹) *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 45000"
                    value={offerForm.offeredSalary}
                    onChange={(e) =>
                      setOfferForm({ ...offerForm, offeredSalary: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl text-[#111827] focus:outline-none focus:border-[#FDBA74]"
                  />
                </div>
                <div>
                  <label className="text-[#475569] font-medium block mb-1">Salary Period</label>
                  <select
                    value={offerForm.salaryPeriod}
                    onChange={(e) =>
                      setOfferForm({ ...offerForm, salaryPeriod: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl text-[#111827] focus:outline-none focus:border-[#FDBA74]"
                  >
                    <option value="Month">Per Month</option>
                    <option value="Year">Per Annum (LPA)</option>
                    <option value="Hour">Per Hour</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#475569] font-medium block mb-1">Employment Type</label>
                  <select
                    value={offerForm.employmentType}
                    onChange={(e) =>
                      setOfferForm({ ...offerForm, employmentType: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl text-[#111827] focus:outline-none focus:border-[#FDBA74]"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Freelance">Freelance</option>
                  </select>
                </div>
                <div>
                  <label className="text-[#475569] font-medium block mb-1">Target Joining Date *</label>
                  <input
                    type="date"
                    required
                    value={offerForm.joiningDate}
                    onChange={(e) =>
                      setOfferForm({ ...offerForm, joiningDate: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl text-[#111827] focus:outline-none focus:border-[#FDBA74]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[#475569] font-medium block mb-1">Offer Terms / Perks</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Includes gym membership, performance bonus, and training gear allowance."
                  value={offerForm.terms}
                  onChange={(e) => setOfferForm({ ...offerForm, terms: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl text-[#111827] focus:outline-none focus:border-[#FDBA74] resize-none"
                />
              </div>

              <div className="pt-3 border-t border-[#E2E8F0] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowOfferModal(false)}
                  className="px-3 py-1.5 bg-[#FFFFFF] hover:bg-[#FFF7ED] text-[#64748B] font-semibold border border-[#E2E8F0] rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-1.5 bg-[#C2410C] hover:bg-[#9A3412] text-white font-semibold rounded-xl"
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
