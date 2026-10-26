import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  MapPin,
  Briefcase,
  Star,
  Award,
  Send,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  Calendar,
  Sparkles,
  ExternalLink,
  ChevronRight,
  UserCheck,
  DollarSign
} from 'lucide-react';
import api from '../../../utils/api';

interface CandidateTrainer {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  profilePhoto?: string;
  specialization?: string;
  professionalHeadline?: string;
  experience?: number;
  qualifications?: string;
  certifications?: string;
  expertise?: string;
  bio?: string;
  preferredLocation?: string;
  employmentPreference?: string;
  expectedSalary?: number;
  personalTrainingFee?: number;
  portfolioUrl?: string;
  earliestJoiningDate?: string;
  availabilityStatus?: string;
  isShortlisted?: boolean;
}

export default function GymAdminBrowseTrainers() {
  const [trainers, setTrainers] = useState<CandidateTrainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');
  const [expertiseFilter, setExpertiseFilter] = useState('all');
  const [experienceFilter, setExperienceFilter] = useState('all');
  const [shortlistedOnly, setShortlistedOnly] = useState(false);
  const [sortBy, setSortBy] = useState('relevance');

  // Selected trainer for profile modal
  const [selectedTrainer, setSelectedTrainer] = useState<CandidateTrainer | null>(null);

  // Hiring Request Modal State
  const [hiringModalOpen, setHiringModalOpen] = useState(false);
  const [hiringTrainer, setHiringTrainer] = useState<CandidateTrainer | null>(null);
  const [hiringForm, setHiringForm] = useState({
    role: '',
    employmentType: 'Full-time' as 'Full-time' | 'Part-time' | 'Contract',
    offeredCompensation: '',
    personalTrainingFee: '',
    workingHours: 'Mon-Sat (6 AM - 2 PM)',
    jobResponsibilities: '',
    requiredExpertise: '',
    expectedJoiningDate: '',
    additionalTerms: '',
    message: ''
  });
  const [submittingHiring, setSubmittingHiring] = useState(false);
  const [hiringSuccessMsg, setHiringSuccessMsg] = useState('');
  const [hiringErrorMsg, setHiringErrorMsg] = useState('');

  const fetchTrainers = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (search.trim()) params.search = search.trim();
      if (locationFilter !== 'all') params.location = locationFilter;
      if (expertiseFilter !== 'all') params.expertise = expertiseFilter;
      if (experienceFilter !== 'all') params.experience = experienceFilter;
      if (shortlistedOnly) params.shortlistedOnly = 'true';
      if (sortBy) params.sortBy = sortBy;

      const res = await api.get('/hiring/owner/trainers', { params });
      if (res.data?.success) {
        setTrainers(res.data.trainers || []);
      }
    } catch (err) {
      console.error('Error fetching candidate trainers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainers();
  }, [search, locationFilter, expertiseFilter, experienceFilter, shortlistedOnly, sortBy]);

  const toggleShortlist = async (trainerId: string) => {
    try {
      const res = await api.post(`/hiring/owner/trainers/${trainerId}/shortlist`);
      if (res.data?.success) {
        setTrainers(prev => prev.map(t => t._id === trainerId ? { ...t, isShortlisted: res.data.isShortlisted } : t));
      }
    } catch (err) {
      console.error('Error toggling shortlist:', err);
    }
  };

  const openHiringModal = (trainer: CandidateTrainer) => {
    setHiringTrainer(trainer);
    setHiringForm({
      role: trainer.specialization || 'Fitness Trainer',
      employmentType: (trainer.employmentPreference === 'Part-time' || trainer.employmentPreference === 'Contract') ? trainer.employmentPreference : 'Full-time',
      offeredCompensation: trainer.expectedSalary ? trainer.expectedSalary.toString() : '38000',
      personalTrainingFee: trainer.personalTrainingFee ? trainer.personalTrainingFee.toString() : '600',
      workingHours: 'Mon-Sat (8 Hours Standard Shift)',
      jobResponsibilities: 'Conduct group HIIT classes, new member orientation, and personalized client coaching.',
      requiredExpertise: trainer.expertise || trainer.specialization || 'Strength & Conditioning',
      expectedJoiningDate: trainer.earliestJoiningDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      additionalTerms: 'Performance incentives & 70/30 PT session split.',
      message: `Hi ${trainer.name}, we would like to offer you a role at our gym. Review our proposed terms and let us know if you accept or wish to negotiate.`
    });
    setHiringSuccessMsg('');
    setHiringErrorMsg('');
    setHiringModalOpen(true);
  };

  const handleSendHiringRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hiringTrainer) return;

    try {
      setSubmittingHiring(true);
      setHiringErrorMsg('');
      setHiringSuccessMsg('');

      const payload = {
        trainerId: hiringTrainer._id,
        role: hiringForm.role,
        employmentType: hiringForm.employmentType,
        offeredCompensation: Number(hiringForm.offeredCompensation),
        personalTrainingFee: Number(hiringForm.personalTrainingFee || 0),
        workingHours: hiringForm.workingHours,
        jobResponsibilities: hiringForm.jobResponsibilities,
        requiredExpertise: hiringForm.requiredExpertise,
        expectedJoiningDate: hiringForm.expectedJoiningDate,
        additionalTerms: hiringForm.additionalTerms,
        message: hiringForm.message
      };

      const res = await api.post('/hiring/owner/hiring-requests', payload);
      if (res.data?.success) {
        setHiringSuccessMsg('Hiring request successfully sent to trainer! You can track this under "Hiring Requests" in your sidebar.');
        setTimeout(() => {
          setHiringModalOpen(false);
          setHiringTrainer(null);
        }, 1800);
      }
    } catch (err: any) {
      console.error('Error submitting hiring request:', err);
      setHiringErrorMsg(err.response?.data?.message || 'Failed to submit hiring request.');
    } finally {
      setSubmittingHiring(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#2DD4BF] uppercase tracking-wider block mb-1">
            DIRECT TALENT RECRUITMENT
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Browse & Hire Trainers
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Discover qualified fitness coaches, review credentials, and send direct hiring proposals
          </p>
        </div>

        <button
          onClick={() => setShortlistedOnly(!shortlistedOnly)}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
            shortlistedOnly
              ? 'bg-[#2DD4BF] text-black border-[#2DD4BF]'
              : 'bg-[#141D1E] text-slate-300 border-[#2A3A3A] hover:border-[#2DD4BF]/50'
          }`}
        >
          <Bookmark size={14} className={shortlistedOnly ? 'fill-black' : ''} />
          <span>{shortlistedOnly ? 'Showing Shortlisted Candidates' : 'View Shortlisted Only'}</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-[#0E1415] border border-[#2A3A3A] rounded-3xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search candidate trainers by name, headline, expertise..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#141D1E] border border-[#2A3A3A] rounded-2xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#2DD4BF]"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold whitespace-nowrap">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-[#141D1E] border border-[#2A3A3A] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#2DD4BF]"
            >
              <option value="relevance">Relevance</option>
              <option value="experience">Experience (High to Low)</option>
              <option value="salaryLow">Salary (Low to High)</option>
              <option value="salaryHigh">Salary (High to Low)</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-[#2A3A3A]/60">
          <div>
            <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Preferred Location</label>
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="w-full bg-[#141D1E] border border-[#2A3A3A] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#2DD4BF]"
            >
              <option value="all">All Locations</option>
              <option value="Bangalore">Bangalore</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Delhi">Delhi NCR</option>
              <option value="Hyderabad">Hyderabad</option>
              <option value="Pune">Pune</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Expertise Specialization</label>
            <select
              value={expertiseFilter}
              onChange={(e) => setExpertiseFilter(e.target.value)}
              className="w-full bg-[#141D1E] border border-[#2A3A3A] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#2DD4BF]"
            >
              <option value="all">All Specialties</option>
              <option value="Strength">Strength & Powerlifting</option>
              <option value="Fat Loss">Fat Loss & HIIT</option>
              <option value="Hypertrophy">Hypertrophy / Bodybuilding</option>
              <option value="Yoga">Yoga & Mobility</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Minimum Experience</label>
            <select
              value={experienceFilter}
              onChange={(e) => setExperienceFilter(e.target.value)}
              className="w-full bg-[#141D1E] border border-[#2A3A3A] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#2DD4BF]"
            >
              <option value="all">Any Experience</option>
              <option value="2">2+ Years</option>
              <option value="5">5+ Years</option>
              <option value="8">8+ Years</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="py-20 text-center space-y-3">
          <div className="w-10 h-10 border-2 border-[#2DD4BF] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Loading candidate trainers...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && trainers.length === 0 && (
        <div className="bg-[#0E1415] border border-[#2A3A3A] rounded-3xl p-12 text-center space-y-3">
          <h3 className="text-base font-bold text-white">No Candidate Trainers Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try resetting your search query or toggling off the shortlisted filter.
          </p>
        </div>
      )}

      {/* Trainer Cards */}
      {!loading && trainers.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trainers.map((trainer) => (
            <div
              key={trainer._id}
              className="bg-[#0E1415] border border-[#2A3A3A] hover:border-[#2DD4BF]/50 rounded-3xl p-6 shadow-xl transition-all flex flex-col justify-between space-y-4 group relative"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-13 h-13 rounded-2xl overflow-hidden bg-[#141D1E] border border-[#2A3A3A] shrink-0">
                      {trainer.profilePhoto ? (
                        <img src={trainer.profilePhoto} alt={trainer.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-lg font-bold text-[#2DD4BF]">
                          {trainer.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white group-hover:text-[#2DD4BF] transition-colors leading-tight">
                        {trainer.name}
                      </h3>
                      <p className="text-xs text-[#2DD4BF] font-semibold truncate max-w-[160px]">
                        {trainer.professionalHeadline || trainer.specialization || 'Fitness Coach'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleShortlist(trainer._id)}
                    className="p-2 rounded-xl bg-[#141D1E] hover:bg-[#1B2728] text-slate-400 hover:text-amber-400 transition-colors border border-[#2A3A3A]"
                    title={trainer.isShortlisted ? 'Remove Bookmark' : 'Shortlist Candidate'}
                  >
                    <Bookmark size={15} className={trainer.isShortlisted ? 'fill-amber-400 text-amber-400' : ''} />
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-3 text-[10px]">
                  <span className="px-2 py-0.5 rounded-md bg-[#141D1E] text-slate-300 border border-[#2A3A3A] flex items-center gap-1">
                    <Briefcase size={10} className="text-[#2DD4BF]" /> {trainer.experience || 3}+ Yrs
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-[#141D1E] text-slate-300 border border-[#2A3A3A] flex items-center gap-1">
                    <MapPin size={10} className="text-[#2DD4BF]" /> {trainer.preferredLocation || 'India'}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-[#141D1E] text-slate-300 border border-[#2A3A3A]">
                    {trainer.employmentPreference || 'Full-time'}
                  </span>
                </div>

                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">
                  {trainer.bio || 'Experienced fitness trainer specializing in progressive overload, client accountability, and body transformations.'}
                </p>

                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[#2A3A3A] text-xs">
                  <div className="bg-[#141D1E]/60 p-2 rounded-xl border border-[#2A3A3A]/60">
                    <span className="text-[10px] text-slate-500 uppercase block font-bold">Expected Salary</span>
                    <span className="font-mono font-bold text-[#2DD4BF]">
                      {trainer.expectedSalary ? `₹${trainer.expectedSalary.toLocaleString()}/mo` : 'Negotiable'}
                    </span>
                  </div>
                  <div className="bg-[#141D1E]/60 p-2 rounded-xl border border-[#2A3A3A]/60">
                    <span className="text-[10px] text-slate-500 uppercase block font-bold">PT Fee / Session</span>
                    <span className="font-mono font-bold text-white">
                      {trainer.personalTrainingFee ? `₹${trainer.personalTrainingFee.toLocaleString()}` : 'Custom'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => setSelectedTrainer(trainer)}
                  className="flex-1 py-2.5 bg-[#141D1E] hover:bg-[#1B2728] text-white border border-[#2A3A3A] hover:border-[#2DD4BF]/40 font-bold text-xs rounded-xl transition-all"
                >
                  View Profile
                </button>
                <button
                  onClick={() => openHiringModal(trainer)}
                  className="flex-1 py-2.5 bg-[#2DD4BF] hover:bg-[#5EEAD4] text-black font-bold text-xs rounded-xl transition-all shadow-md shadow-[#2DD4BF]/20 flex items-center justify-center gap-1.5"
                >
                  <Send size={13} />
                  <span>Send Request</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL 1: VIEW TRAINER PROFILE */}
      {selectedTrainer && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0E1415] border border-[#2DD4BF]/40 rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-[#2A3A3A] pb-3">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl overflow-hidden bg-[#141D1E] border border-[#2A3A3A]">
                  {selectedTrainer.profilePhoto ? (
                    <img src={selectedTrainer.profilePhoto} alt={selectedTrainer.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-lg font-bold text-[#2DD4BF]">
                      {selectedTrainer.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{selectedTrainer.name}</h3>
                  <p className="text-xs text-[#2DD4BF] font-semibold">{selectedTrainer.professionalHeadline || selectedTrainer.specialization}</p>
                  <p className="text-[11px] text-slate-400">{selectedTrainer.email} • {selectedTrainer.phone || 'Phone verified'}</p>
                </div>
              </div>
              <button onClick={() => setSelectedTrainer(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-[#141D1E] p-3 rounded-2xl border border-[#2A3A3A]">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Expected Monthly Salary</span>
                  <span className="font-mono font-bold text-sm text-[#2DD4BF]">
                    {selectedTrainer.expectedSalary ? `₹${selectedTrainer.expectedSalary.toLocaleString()}` : 'Negotiable'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Personal Training Session Fee</span>
                  <span className="font-mono font-bold text-sm text-white">
                    {selectedTrainer.personalTrainingFee ? `₹${selectedTrainer.personalTrainingFee.toLocaleString()}` : 'Custom'}
                  </span>
                </div>
              </div>

              <div>
                <strong className="text-white block mb-1">Professional Introduction:</strong>
                <p className="text-slate-300 leading-relaxed bg-[#141D1E]/40 p-3 rounded-xl border border-[#2A3A3A]">
                  {selectedTrainer.bio || 'Seasoned fitness instructor with extensive expertise in strength training, client motivation, and nutrition.'}
                </p>
              </div>

              <div>
                <strong className="text-white block mb-1">Certifications & Qualifications:</strong>
                <p className="text-slate-300 bg-[#141D1E]/40 p-3 rounded-xl border border-[#2A3A3A]">
                  {selectedTrainer.certifications || selectedTrainer.qualifications || 'ACE, CSCS, CPR/AED Certified'}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-[#2A3A3A] flex gap-3">
              <button
                onClick={() => {
                  const t = selectedTrainer;
                  setSelectedTrainer(null);
                  openHiringModal(t);
                }}
                className="flex-1 py-2.5 bg-[#2DD4BF] hover:bg-[#5EEAD4] text-black font-bold text-xs rounded-xl shadow-md shadow-[#2DD4BF]/20 flex items-center justify-center gap-1.5"
              >
                <Send size={13} />
                <span>Send Hiring Proposal</span>
              </button>
              <button
                onClick={() => setSelectedTrainer(null)}
                className="px-5 py-2.5 bg-[#141D1E] text-slate-400 hover:text-white text-xs font-semibold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: SEND HIRING REQUEST */}
      {hiringModalOpen && hiringTrainer && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0E1415] border border-[#2DD4BF]/40 rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#2A3A3A] pb-3">
              <div>
                <span className="text-[10px] font-bold text-[#2DD4BF] uppercase tracking-wider block">
                  PROPOSAL INTAKE
                </span>
                <h3 className="text-base font-bold text-white">Send Hiring Request to {hiringTrainer.name}</h3>
              </div>
              <button onClick={() => setHiringModalOpen(false)} className="text-slate-400 hover:text-white text-sm">✕</button>
            </div>

            {hiringSuccessMsg && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 size={15} />
                <span>{hiringSuccessMsg}</span>
              </div>
            )}

            {hiringErrorMsg && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs font-bold">
                {hiringErrorMsg}
              </div>
            )}

            <form onSubmit={handleSendHiringRequest} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Trainer Role *</label>
                  <input
                    type="text"
                    required
                    value={hiringForm.role}
                    onChange={(e) => setHiringForm({ ...hiringForm, role: e.target.value })}
                    className="w-full bg-[#141D1E] border border-[#2A3A3A] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#2DD4BF]"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Employment Type *</label>
                  <select
                    value={hiringForm.employmentType}
                    onChange={(e) => setHiringForm({ ...hiringForm, employmentType: e.target.value as any })}
                    className="w-full bg-[#141D1E] border border-[#2A3A3A] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#2DD4BF]"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract / Freelance</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Offered Monthly Salary (₹) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={hiringForm.offeredCompensation}
                    onChange={(e) => setHiringForm({ ...hiringForm, offeredCompensation: e.target.value })}
                    className="w-full bg-[#141D1E] border border-[#2A3A3A] rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-[#2DD4BF]"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Personal Training Fee / Session (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={hiringForm.personalTrainingFee}
                    onChange={(e) => setHiringForm({ ...hiringForm, personalTrainingFee: e.target.value })}
                    className="w-full bg-[#141D1E] border border-[#2A3A3A] rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-[#2DD4BF]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Working Schedule</label>
                  <input
                    type="text"
                    value={hiringForm.workingHours}
                    onChange={(e) => setHiringForm({ ...hiringForm, workingHours: e.target.value })}
                    className="w-full bg-[#141D1E] border border-[#2A3A3A] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#2DD4BF]"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Expected Joining Date *</label>
                  <input
                    type="date"
                    required
                    value={hiringForm.expectedJoiningDate}
                    onChange={(e) => setHiringForm({ ...hiringForm, expectedJoiningDate: e.target.value })}
                    className="w-full bg-[#141D1E] border border-[#2A3A3A] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#2DD4BF]"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Job Responsibilities *</label>
                <textarea
                  required
                  rows={2}
                  value={hiringForm.jobResponsibilities}
                  onChange={(e) => setHiringForm({ ...hiringForm, jobResponsibilities: e.target.value })}
                  className="w-full bg-[#141D1E] border border-[#2A3A3A] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#2DD4BF]"
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Terms & Message to Candidate</label>
                <textarea
                  rows={2}
                  value={hiringForm.message}
                  onChange={(e) => setHiringForm({ ...hiringForm, message: e.target.value })}
                  className="w-full bg-[#141D1E] border border-[#2A3A3A] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#2DD4BF]"
                />
              </div>

              <div className="pt-3 border-t border-[#2A3A3A] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setHiringModalOpen(false)}
                  className="px-4 py-2 bg-[#141D1E] text-slate-400 hover:text-white rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingHiring}
                  className="px-6 py-2 bg-[#2DD4BF] hover:bg-[#5EEAD4] text-black font-bold rounded-xl transition-all shadow-md shadow-[#2DD4BF]/20 flex items-center gap-1.5"
                >
                  {submittingHiring ? 'Sending...' : 'Send Hiring Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
