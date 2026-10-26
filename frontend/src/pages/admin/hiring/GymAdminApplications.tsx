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
  fullName: string;
  email: string;
  phone: string;
  yearsOfExperience: number;
  qualifications: string[];
  certifications: string[];
  expertise: string[];
  expectedSalary: string;
  preferredLocation: string;
  employmentPreference: string;
  availability: string;
  coverLetter?: string;
  resumeUrl: string;
  status: string;
  createdAt: string;
}

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
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5600/api/hiring/admin/jobs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setJobsList(res.data.data.map((j: any) => ({ _id: j._id, title: j.title })));
      }
    } catch (err) {
      console.error('Failed to load jobs list:', err);
    }
  };

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params: any = {};
      if (statusFilter) params.status = statusFilter;
      if (jobFilter) params.jobId = jobFilter;

      const res = await axios.get('http://localhost:5600/api/hiring/admin/applications', {
        headers: { Authorization: `Bearer ${token}` },
        params
      });
      if (res.data.success) {
        setApplications(res.data.data);
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
      const token = localStorage.getItem('token');
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
      const token = localStorage.getItem('token');
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
      const token = localStorage.getItem('token');
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
    return (
      app.fullName?.toLowerCase().includes(term) ||
      app.email?.toLowerCase().includes(term) ||
      app.jobId?.title?.toLowerCase().includes(term) ||
      app.expertise?.some((e) => e.toLowerCase().includes(term))
    );
  });

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="w-7 h-7 text-[#2DD4BF]" />
            Trainer Applications
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Review candidate resumes, shortlist elite fitness experts, schedule interviews and extend offers
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/admin/hiring/jobs"
            className="px-4 py-2 bg-[#141D1E] hover:bg-[#1B2728] text-slate-300 hover:text-white rounded-xl border border-[#2A3A3A] text-sm transition-all flex items-center gap-2"
          >
            <Briefcase className="w-4 h-4 text-[#2DD4BF]" />
            Manage Vacancies
          </Link>
          <Link
            to="/admin/hiring/shortlisted"
            className="px-4 py-2 bg-[#2DD4BF]/10 hover:bg-[#2DD4BF]/20 text-[#2DD4BF] border border-[#2DD4BF]/30 rounded-xl text-sm font-medium transition-all"
          >
            View Shortlisted
          </Link>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-[#0E1415] p-4 rounded-2xl border border-[#2A3A3A] flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search candidates by name, email, job title, expertise..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#141D1E] border border-[#2A3A3A] rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#2DD4BF]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Job Filter */}
          <select
            value={jobFilter}
            onChange={(e) => setJobFilter(e.target.value)}
            className="px-3 py-2 bg-[#141D1E] border border-[#2A3A3A] rounded-xl text-slate-300 text-sm focus:outline-none focus:border-[#2DD4BF]"
          >
            <option value="">All Vacancies</option>
            {jobsList.map((j) => (
              <option key={j._id} value={j._id}>
                {j.title}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-[#141D1E] border border-[#2A3A3A] rounded-xl text-slate-300 text-sm focus:outline-none focus:border-[#2DD4BF]"
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
        <div className="p-12 text-center text-slate-400 bg-[#0E1415] rounded-2xl border border-[#2A3A3A]">
          <div className="inline-block animate-spin w-8 h-8 border-4 border-[#2DD4BF] border-t-transparent rounded-full mb-3" />
          <p>Loading candidate applications...</p>
        </div>
      ) : filteredApps.length === 0 ? (
        <div className="p-12 text-center bg-[#0E1415] rounded-2xl border border-[#2A3A3A]">
          <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-white mb-1">No applications found</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            {search || statusFilter || jobFilter
              ? 'No candidate applications match your filter criteria.'
              : 'You do not have any applications submitted yet. Ensure your vacancies are published on the Careers portal.'}
          </p>
        </div>
      ) : (
        <div className="bg-[#0E1415] rounded-2xl border border-[#2A3A3A] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-[#141D1E] text-xs uppercase text-slate-400 font-semibold border-b border-[#2A3A3A]">
                <tr>
                  <th className="px-6 py-4">Candidate</th>
                  <th className="px-6 py-4">Applied Vacancy</th>
                  <th className="px-6 py-4">Experience & Expertise</th>
                  <th className="px-6 py-4">Expected Salary</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A3A3A]">
                {filteredApps.map((app) => (
                  <tr key={app._id} className="hover:bg-[#141D1E]/50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-semibold text-white flex items-center gap-2">
                          {app.fullName}
                          {app.resumeUrl && (
                            <a
                              href={`http://localhost:5600${app.resumeUrl}`}
                              target="_blank"
                              rel="noreferrer"
                              title="Download / View Resume"
                              className="text-[#2DD4BF] hover:text-[#5EEAD4]"
                            >
                              <FileText className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3 text-slate-500" />
                            {app.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-500" />
                            {app.phone}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-200">
                        {app.jobId?.title || 'Gym Trainer'}
                      </div>
                      <div className="text-xs text-slate-400">
                        {app.jobId?.employmentType} • {app.jobId?.location}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-xs text-slate-300 font-medium">
                        {app.yearsOfExperience} yrs experience
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {app.expertise?.slice(0, 2).map((exp, i) => (
                          <span
                            key={i}
                            className="text-[10px] bg-[#1B2728] text-slate-300 px-1.5 py-0.5 rounded border border-[#2A3A3A]"
                          >
                            {exp}
                          </span>
                        ))}
                        {app.expertise?.length > 2 && (
                          <span className="text-[10px] text-slate-500">
                            +{app.expertise.length - 2}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4 font-mono text-xs text-slate-300">
                      {app.expectedSalary || 'Negotiable'}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusBadge(
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
                          className="px-2.5 py-1.5 bg-[#141D1E] hover:bg-[#1B2728] border border-[#2A3A3A] rounded-lg text-slate-300 hover:text-white text-xs flex items-center gap-1.5 transition-all"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#2DD4BF]" />
                          Review
                        </button>

                        {/* Quick Shortlist Button if not yet shortlisted */}
                        {app.status === 'Applied' && (
                          <button
                            disabled={actionLoading}
                            onClick={() => handleStatusChange(app._id, 'Shortlisted')}
                            className="px-2.5 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 rounded-lg text-xs font-medium transition-all"
                          >
                            Shortlist
                          </button>
                        )}
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
          <div className="bg-[#0E1415] border border-[#2A3A3A] rounded-2xl max-w-2xl w-full p-6 text-white space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-start justify-between border-b border-[#2A3A3A] pb-4">
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2">
                  {selectedApp.fullName}
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full border ${getStatusBadge(
                      selectedApp.status
                    )}`}
                  >
                    {selectedApp.status}
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Applied for: <span className="text-[#2DD4BF]">{selectedApp.jobId?.title}</span> •{' '}
                  {new Date(selectedApp.createdAt).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contact & Basics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-[#141D1E] p-4 rounded-xl border border-[#2A3A3A] text-xs">
              <div>
                <span className="text-slate-500 block">Phone</span>
                <span className="font-semibold text-slate-200">{selectedApp.phone}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Email</span>
                <span className="font-semibold text-slate-200 truncate block">
                  {selectedApp.email}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Experience</span>
                <span className="font-semibold text-slate-200">
                  {selectedApp.yearsOfExperience} Years
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Expected Salary</span>
                <span className="font-semibold text-[#2DD4BF] font-mono">
                  {selectedApp.expectedSalary || 'Negotiable'}
                </span>
              </div>
            </div>

            {/* Expertise & Skills */}
            <div>
              <h4 className="text-xs uppercase font-semibold text-slate-400 mb-2">
                Specializations & Expertise
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {selectedApp.expertise?.map((e, idx) => (
                  <span
                    key={idx}
                    className="text-xs bg-[#1B2728] text-slate-300 px-2.5 py-1 rounded-lg border border-[#2A3A3A]"
                  >
                    {e}
                  </span>
                ))}
              </div>
            </div>

            {/* Certifications & Qualifications */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#141D1E] p-3 rounded-xl border border-[#2A3A3A]">
                <h4 className="text-xs uppercase font-semibold text-[#2DD4BF] mb-2 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5" /> Certifications
                </h4>
                {selectedApp.certifications?.length > 0 ? (
                  <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                    {selectedApp.certifications.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-500 italic">None listed</p>
                )}
              </div>

              <div className="bg-[#141D1E] p-3 rounded-xl border border-[#2A3A3A]">
                <h4 className="text-xs uppercase font-semibold text-[#2DD4BF] mb-2 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5" /> Qualifications
                </h4>
                {selectedApp.qualifications?.length > 0 ? (
                  <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                    {selectedApp.qualifications.map((q, i) => (
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
                <h4 className="text-xs uppercase font-semibold text-slate-400 mb-1">
                  Introduction / Cover Note
                </h4>
                <div className="text-xs text-slate-300 bg-[#141D1E] p-3.5 rounded-xl border border-[#2A3A3A] leading-relaxed">
                  {selectedApp.coverLetter}
                </div>
              </div>
            )}

            {/* Resume Link */}
            {selectedApp.resumeUrl && (
              <div className="flex items-center justify-between bg-[#1B2728] p-3.5 rounded-xl border border-[#2DD4BF]/30">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#2DD4BF]" />
                  <div>
                    <span className="text-xs font-semibold text-white block">
                      Candidate Resume Document
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Verified uploaded credentials
                    </span>
                  </div>
                </div>
                <a
                  href={`http://localhost:5600${selectedApp.resumeUrl}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-[#2DD4BF] hover:bg-[#5EEAD4] text-black font-semibold text-xs rounded-lg transition-all flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Open Resume
                </a>
              </div>
            )}

            {/* Action Bar */}
            <div className="pt-4 border-t border-[#2A3A3A] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  disabled={actionLoading}
                  onClick={() => handleStatusChange(selectedApp._id, 'Under Review')}
                  className="px-3 py-2 bg-[#141D1E] hover:bg-[#1B2728] border border-yellow-500/40 text-yellow-400 rounded-xl text-xs font-medium transition-all"
                >
                  Mark Under Review
                </button>
                <button
                  disabled={actionLoading}
                  onClick={() => handleStatusChange(selectedApp._id, 'Shortlisted')}
                  className="px-3 py-2 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/40 text-purple-300 rounded-xl text-xs font-medium transition-all"
                >
                  Shortlist
                </button>
                <button
                  disabled={actionLoading}
                  onClick={() => handleStatusChange(selectedApp._id, 'Rejected')}
                  className="px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/40 text-rose-400 rounded-xl text-xs font-medium transition-all"
                >
                  Reject
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowInterviewModal(true)}
                  className="px-3 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  Schedule Interview
                </button>
                <button
                  onClick={() => setShowOfferModal(true)}
                  className="px-3 py-2 bg-[#2DD4BF] hover:bg-[#5EEAD4] text-black font-semibold rounded-xl text-xs transition-all flex items-center gap-1.5"
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
          <div className="bg-[#0E1415] border border-[#2A3A3A] rounded-2xl max-w-md w-full p-6 text-white space-y-4">
            <div className="flex items-center justify-between border-b border-[#2A3A3A] pb-3">
              <h3 className="font-bold text-base flex items-center gap-2 text-cyan-400">
                <Calendar className="w-5 h-5" />
                Schedule Interview: {selectedApp.fullName}
              </h3>
              <button
                onClick={() => setShowInterviewModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleScheduleInterview} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={interviewForm.date}
                    onChange={(e) => setInterviewForm({ ...interviewForm, date: e.target.value })}
                    className="w-full px-3 py-2 bg-[#141D1E] border border-[#2A3A3A] rounded-xl text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Time *</label>
                  <input
                    type="time"
                    required
                    value={interviewForm.time}
                    onChange={(e) => setInterviewForm({ ...interviewForm, time: e.target.value })}
                    className="w-full px-3 py-2 bg-[#141D1E] border border-[#2A3A3A] rounded-xl text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Mode *</label>
                  <select
                    value={interviewForm.mode}
                    onChange={(e) => setInterviewForm({ ...interviewForm, mode: e.target.value })}
                    className="w-full px-3 py-2 bg-[#141D1E] border border-[#2A3A3A] rounded-xl text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="Online">Online (Google Meet / Zoom)</option>
                    <option value="In-Person">In-Person at Gym</option>
                    <option value="Phone">Phone Call</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Estimated Duration</label>
                  <input
                    type="text"
                    value={interviewForm.duration}
                    onChange={(e) =>
                      setInterviewForm({ ...interviewForm, duration: e.target.value })
                    }
                    placeholder="e.g. 30 mins"
                    className="w-full px-3 py-2 bg-[#141D1E] border border-[#2A3A3A] rounded-xl text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Meeting Link or Location *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. https://meet.google.com/xyz or Gym Floor 2"
                  value={interviewForm.locationOrLink}
                  onChange={(e) =>
                    setInterviewForm({ ...interviewForm, locationOrLink: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-[#141D1E] border border-[#2A3A3A] rounded-xl text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Instructions for Trainer</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Please bring workout apparel for practical fitness demonstration"
                  value={interviewForm.instructions}
                  onChange={(e) =>
                    setInterviewForm({ ...interviewForm, instructions: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-[#141D1E] border border-[#2A3A3A] rounded-xl text-white focus:outline-none focus:border-cyan-400 resize-none"
                />
              </div>

              <div className="pt-3 border-t border-[#2A3A3A] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowInterviewModal(false)}
                  className="px-3 py-1.5 bg-[#141D1E] hover:bg-[#1B2728] text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold rounded-xl"
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
          <div className="bg-[#0E1415] border border-[#2A3A3A] rounded-2xl max-w-md w-full p-6 text-white space-y-4">
            <div className="flex items-center justify-between border-b border-[#2A3A3A] pb-3">
              <h3 className="font-bold text-base flex items-center gap-2 text-[#2DD4BF]">
                <Gift className="w-5 h-5" />
                Issue Offer: {selectedApp.fullName}
              </h3>
              <button
                onClick={() => setShowOfferModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendOffer} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Offered Salary (₹) *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 45000"
                    value={offerForm.offeredSalary}
                    onChange={(e) =>
                      setOfferForm({ ...offerForm, offeredSalary: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-[#141D1E] border border-[#2A3A3A] rounded-xl text-white focus:outline-none focus:border-[#2DD4BF]"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Salary Period</label>
                  <select
                    value={offerForm.salaryPeriod}
                    onChange={(e) =>
                      setOfferForm({ ...offerForm, salaryPeriod: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-[#141D1E] border border-[#2A3A3A] rounded-xl text-white focus:outline-none focus:border-[#2DD4BF]"
                  >
                    <option value="Month">Per Month</option>
                    <option value="Year">Per Annum (LPA)</option>
                    <option value="Hour">Per Hour</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Employment Type</label>
                  <select
                    value={offerForm.employmentType}
                    onChange={(e) =>
                      setOfferForm({ ...offerForm, employmentType: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-[#141D1E] border border-[#2A3A3A] rounded-xl text-white focus:outline-none focus:border-[#2DD4BF]"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Freelance">Freelance</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Target Joining Date *</label>
                  <input
                    type="date"
                    required
                    value={offerForm.joiningDate}
                    onChange={(e) =>
                      setOfferForm({ ...offerForm, joiningDate: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-[#141D1E] border border-[#2A3A3A] rounded-xl text-white focus:outline-none focus:border-[#2DD4BF]"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Offer Terms / Perks</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Includes gym membership, performance bonus, and training gear allowance."
                  value={offerForm.terms}
                  onChange={(e) => setOfferForm({ ...offerForm, terms: e.target.value })}
                  className="w-full px-3 py-2 bg-[#141D1E] border border-[#2A3A3A] rounded-xl text-white focus:outline-none focus:border-[#2DD4BF] resize-none"
                />
              </div>

              <div className="pt-3 border-t border-[#2A3A3A] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowOfferModal(false)}
                  className="px-3 py-1.5 bg-[#141D1E] hover:bg-[#1B2728] text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-1.5 bg-[#2DD4BF] hover:bg-[#5EEAD4] text-black font-semibold rounded-xl"
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
