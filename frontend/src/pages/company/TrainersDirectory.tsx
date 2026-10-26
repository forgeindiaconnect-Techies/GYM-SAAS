import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  MapPin,
  Briefcase,
  DollarSign,
  Star,
  Award,
  ChevronRight,
  UserCheck,
  Send,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowLeft,
  X,
  ExternalLink,
  Shield,
  Activity
} from 'lucide-react';
import api from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';

interface TrainerProfile {
  _id: string;
  name: string;
  profilePhoto?: string;
  specialization?: string;
  professionalHeadline?: string;
  experience?: number;
  trainingMode: string;
  qualifications?: string;
  certifications?: string;
  expertise?: string;
  bio?: string;
  availability?: string;
  availableDays?: string;
  fee?: number;
  paymentType?: string;
  averageRating?: number;
  totalReviews?: number;
  isPublicRecruitment?: boolean;
  preferredLocation?: string;
  employmentPreference?: string;
  expectedSalary?: number;
  personalTrainingFee?: number;
  portfolioUrl?: string;
  earliestJoiningDate?: string;
  availabilityStatus?: string;
  workHistory?: Array<{ company: string; role: string; duration: string; description?: string }>;
}

export default function TrainersDirectory() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [trainers, setTrainers] = useState<TrainerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');
  const [expertiseFilter, setExpertiseFilter] = useState('all');
  const [experienceFilter, setExperienceFilter] = useState('all');
  const [employmentFilter, setEmploymentFilter] = useState('all');
  const [salaryFilter, setSalaryFilter] = useState('all');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('relevance');

  // Selected trainer for modal view
  const [selectedTrainer, setSelectedTrainer] = useState<TrainerProfile | null>(null);

  // Hiring Request Modal (for Gym Owners)
  const [hiringModalOpen, setHiringModalOpen] = useState(false);
  const [hiringTrainer, setHiringTrainer] = useState<TrainerProfile | null>(null);
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
      if (employmentFilter !== 'all') params.employmentType = employmentFilter;
      if (availabilityFilter !== 'all') params.availability = availabilityFilter;
      if (sortBy) params.sortBy = sortBy;

      if (salaryFilter !== 'all') {
        if (salaryFilter === 'under30k') params.salaryMax = 30000;
        else if (salaryFilter === '30k-50k') { params.salaryMin = 30000; params.salaryMax = 50000; }
        else if (salaryFilter === '50k-80k') { params.salaryMin = 50000; params.salaryMax = 80000; }
        else if (salaryFilter === 'above80k') params.salaryMin = 80000;
      }

      const res = await api.get('/hiring/public/trainers', { params });
      if (res.data?.success) {
        setTrainers(res.data.trainers || []);
      }
    } catch (err) {
      console.error('Error fetching trainers directory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainers();
  }, [search, locationFilter, expertiseFilter, experienceFilter, employmentFilter, salaryFilter, availabilityFilter, sortBy]);

  const handleHireClick = (trainer: TrainerProfile) => {
    // Check if user is logged in
    if (!user) {
      navigate('/login?portal=gym-owner&redirect=/trainers');
      return;
    }

    // Check if user is a Gym Owner
    if (user.role === 'ADMIN' || user.role === 'GYM_OWNER') {
      setHiringTrainer(trainer);
      setHiringForm({
        role: trainer.specialization || 'Fitness Trainer',
        employmentType: (trainer.employmentPreference === 'Part-time' || trainer.employmentPreference === 'Contract') ? trainer.employmentPreference : 'Full-time',
        offeredCompensation: trainer.expectedSalary ? trainer.expectedSalary.toString() : '35000',
        personalTrainingFee: trainer.personalTrainingFee ? trainer.personalTrainingFee.toString() : '500',
        workingHours: 'Mon-Sat 8 Hours Shift',
        jobResponsibilities: 'Conduct group classes, member onboarding assessments, client personal training and floor guidance.',
        requiredExpertise: trainer.expertise || trainer.specialization || 'General Fitness',
        expectedJoiningDate: trainer.earliestJoiningDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        additionalTerms: 'Standard 3-month probation period with commission split.',
        message: `Hi ${trainer.name}, we were impressed by your profile on Gymora and would like to extend a hiring proposal for our gym.`
      });
      setHiringSuccessMsg('');
      setHiringErrorMsg('');
      setHiringModalOpen(true);
    } else {
      alert('Only verified Gym Owners can send direct hiring requests. Please log in as a Gym Owner.');
    }
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
        setHiringSuccessMsg('Hiring request successfully sent to trainer! You can track negotiations in your Gym Owner Dashboard.');
        setTimeout(() => {
          setHiringModalOpen(false);
          setHiringTrainer(null);
        }, 2000);
      }
    } catch (err: any) {
      console.error('Error submitting hiring request:', err);
      setHiringErrorMsg(err.response?.data?.message || 'Failed to submit hiring request. Please try again.');
    } finally {
      setSubmittingHiring(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080B0C] text-[#F5FAFA] selection:bg-[#2DD4BF] selection:text-black">
      {/* Top Navbar */}
      <nav className="border-b border-[#2A3A3A] bg-[#0E1415]/95 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-2 mr-4">
              <div className="w-9 h-9 bg-[#2DD4BF] rounded-xl flex items-center justify-center shadow-md shadow-[#2DD4BF]/25">
                <Activity className="text-black" size={20} />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">Gymora</span>
            </Link>
            <div className="h-5 w-px bg-[#2A3A3A] hidden sm:block" />
            <span className="text-xs font-bold text-[#2DD4BF] uppercase tracking-wider hidden sm:inline">
              Public Trainer Directory
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              to="/careers"
              className="px-3.5 py-2 bg-[#141D1E] hover:bg-[#1B2728] text-slate-300 hover:text-white border border-[#2A3A3A] font-semibold text-xs sm:text-sm rounded-xl transition-all flex items-center gap-1.5"
            >
              <Briefcase size={14} className="text-[#2DD4BF]" />
              <span>Find Gym Jobs</span>
            </Link>
            <Link
              to="/login?portal=gym-owner"
              className="px-4 py-2 bg-[#2DD4BF] hover:bg-[#5EEAD4] text-black font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-[#2DD4BF]/20 flex items-center gap-1.5"
            >
              <Building2 size={14} />
              <span>Gym Owner Login</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Header */}
      <header className="relative py-14 px-4 sm:px-6 lg:px-8 border-b border-[#2A3A3A] bg-gradient-to-b from-[#0E1415] via-[#080B0C] to-[#080B0C]">
        <div className="max-w-7xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#141D1E] border border-[#2A3A3A] text-xs font-bold text-[#2DD4BF]">
            <Sparkles size={13} />
            <span>DISCOVER & RECRUIT CERTIFIED FITNESS TRAINERS</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Explore Verified Gym Trainers & Coaches
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Browse qualified fitness coaches, review credentials, compare expected monthly salary vs. per-session PT fees, and send direct hiring offers.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/careers"
              className="px-5 py-2.5 rounded-xl bg-[#141D1E] hover:bg-[#1B2728] border border-[#2A3A3A] text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <Briefcase size={14} className="text-[#2DD4BF]" />
              <span>Are You a Trainer? View Active Gym Vacancies</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        
        {/* Search & Filter Toolbar */}
        <div className="bg-[#0E1415] border border-[#2A3A3A] rounded-3xl p-5 shadow-xl space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search trainers by name, headline, specialization or skills..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#141D1E] border border-[#2A3A3A] rounded-2xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#2DD4BF]"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Sorting */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-semibold whitespace-nowrap">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-[#141D1E] border border-[#2A3A3A] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#2DD4BF]"
              >
                <option value="relevance">Most Relevant</option>
                <option value="experience">Experience (High to Low)</option>
                <option value="salaryLow">Expected Salary (Low to High)</option>
                <option value="salaryHigh">Expected Salary (High to Low)</option>
                <option value="rating">Top Rated (Stars)</option>
              </select>
            </div>
          </div>

          {/* Filter Pills Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-2 border-t border-[#2A3A3A]/60">
            {/* Location */}
            <div>
              <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Location</label>
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full bg-[#141D1E] border border-[#2A3A3A] rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#2DD4BF]"
              >
                <option value="all">All Locations</option>
                <option value="Bangalore">Bangalore</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Delhi">Delhi NCR</option>
                <option value="Hyderabad">Hyderabad</option>
                <option value="Pune">Pune</option>
                <option value="Chennai">Chennai</option>
              </select>
            </div>

            {/* Expertise */}
            <div>
              <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Specialization</label>
              <select
                value={expertiseFilter}
                onChange={(e) => setExpertiseFilter(e.target.value)}
                className="w-full bg-[#141D1E] border border-[#2A3A3A] rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#2DD4BF]"
              >
                <option value="all">All Specialties</option>
                <option value="Strength">Strength & Powerlifting</option>
                <option value="Fat Loss">Fat Loss & HIIT</option>
                <option value="Hypertrophy">Hypertrophy / Bodybuilding</option>
                <option value="Yoga">Yoga & Mobility</option>
                <option value="Rehabilitation">Physio & Rehabilitation</option>
              </select>
            </div>

            {/* Experience */}
            <div>
              <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Experience</label>
              <select
                value={experienceFilter}
                onChange={(e) => setExperienceFilter(e.target.value)}
                className="w-full bg-[#141D1E] border border-[#2A3A3A] rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#2DD4BF]"
              >
                <option value="all">Any Experience</option>
                <option value="2">2+ Years</option>
                <option value="5">5+ Years</option>
                <option value="8">8+ Years</option>
              </select>
            </div>

            {/* Employment Preference */}
            <div>
              <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Employment</label>
              <select
                value={employmentFilter}
                onChange={(e) => setEmploymentFilter(e.target.value)}
                className="w-full bg-[#141D1E] border border-[#2A3A3A] rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#2DD4BF]"
              >
                <option value="all">Any Type</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract / Freelance</option>
              </select>
            </div>

            {/* Salary Expectation */}
            <div>
              <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Expected Salary</label>
              <select
                value={salaryFilter}
                onChange={(e) => setSalaryFilter(e.target.value)}
                className="w-full bg-[#141D1E] border border-[#2A3A3A] rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#2DD4BF]"
              >
                <option value="all">Any Salary</option>
                <option value="under30k">Under ₹30,000</option>
                <option value="30k-50k">₹30,000 - ₹50,000</option>
                <option value="50k-80k">₹50,000 - ₹80,000</option>
                <option value="above80k">Above ₹80,000</option>
              </select>
            </div>

            {/* Availability */}
            <div>
              <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Availability</label>
              <select
                value={availabilityFilter}
                onChange={(e) => setAvailabilityFilter(e.target.value)}
                className="w-full bg-[#141D1E] border border-[#2A3A3A] rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#2DD4BF]"
              >
                <option value="all">Any Status</option>
                <option value="Online">Available Immediately</option>
                <option value="Busy">Currently Engaged</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Count Bar */}
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span>Found <strong className="text-white">{trainers.length}</strong> available fitness coaches</span>
          <span className="text-[11px] text-slate-500">Public profile view active</span>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-20 text-center space-y-3">
            <div className="w-10 h-10 border-2 border-[#2DD4BF] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-400">Loading verified trainer directory...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && trainers.length === 0 && (
          <div className="bg-[#0E1415] border border-[#2A3A3A] rounded-3xl p-12 text-center space-y-4">
            <div className="w-14 h-14 bg-[#141D1E] text-slate-400 rounded-2xl flex items-center justify-center mx-auto border border-[#2A3A3A]">
              <Search size={28} />
            </div>
            <h3 className="text-lg font-bold text-white">No Trainers Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              No trainer profiles match your current filter parameters. Try clearing some filters or searching for broader terms.
            </p>
            <button
              onClick={() => {
                setSearch('');
                setLocationFilter('all');
                setExpertiseFilter('all');
                setExperienceFilter('all');
                setEmploymentFilter('all');
                setSalaryFilter('all');
                setAvailabilityFilter('all');
              }}
              className="px-4 py-2 bg-[#2DD4BF] text-black font-bold text-xs rounded-xl"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Trainer Cards Grid */}
        {!loading && trainers.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trainers.map((trainer) => (
              <div
                key={trainer._id}
                className="bg-[#0E1415] border border-[#2A3A3A] hover:border-[#2DD4BF]/50 rounded-3xl p-6 shadow-xl transition-all flex flex-col justify-between space-y-5 group"
              >
                <div>
                  {/* Card Header: Avatar & Availability */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-2xl overflow-hidden bg-[#141D1E] border border-[#2A3A3A] shrink-0">
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
                        <p className="text-xs text-[#2DD4BF] font-medium truncate max-w-[180px]">
                          {trainer.professionalHeadline || trainer.specialization || 'Fitness Coach'}
                        </p>
                        <div className="flex items-center gap-1 text-[11px] text-amber-400 mt-0.5">
                          <Star size={11} fill="currentColor" />
                          <span className="font-bold">{trainer.averageRating || 5.0}</span>
                          <span className="text-slate-500">({trainer.totalReviews || 12} reviews)</span>
                        </div>
                      </div>
                    </div>

                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 whitespace-nowrap">
                      {trainer.availabilityStatus === 'Busy' ? 'Engaged' : 'Available'}
                    </span>
                  </div>

                  {/* Badges / Quick Meta */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    <span className="px-2.5 py-1 rounded-lg bg-[#141D1E] text-slate-300 border border-[#2A3A3A] text-[10px] font-semibold flex items-center gap-1">
                      <Briefcase size={11} className="text-[#2DD4BF]" /> {trainer.experience || 3}+ Yrs Exp
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-[#141D1E] text-slate-300 border border-[#2A3A3A] text-[10px] font-semibold flex items-center gap-1">
                      <MapPin size={11} className="text-[#2DD4BF]" /> {trainer.preferredLocation || 'Pan India'}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-[#141D1E] text-slate-300 border border-[#2A3A3A] text-[10px] font-semibold">
                      {trainer.employmentPreference || 'Full-time'}
                    </span>
                  </div>

                  {/* Bio / Summary */}
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                    {trainer.bio || 'Dedicated fitness coach specialized in body transformations, progressive overload training, and athletic conditioning.'}
                  </p>

                  {/* Qualifications & Certs Summary */}
                  {(trainer.certifications || trainer.qualifications) && (
                    <div className="p-3 rounded-2xl bg-[#141D1E] border border-[#2A3A3A] text-[11px] text-slate-300 space-y-1 mb-4">
                      <div className="flex items-center gap-1 font-bold text-white text-[10px] uppercase tracking-wider">
                        <Award size={12} className="text-[#2DD4BF]" /> Certifications & Credentials
                      </div>
                      <p className="text-slate-400 line-clamp-1">{trainer.certifications || trainer.qualifications}</p>
                    </div>
                  )}

                  {/* Compensation Distinction: Monthly Salary vs PT Fee */}
                  <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[#2A3A3A] text-xs">
                    <div className="bg-[#141D1E]/60 p-2.5 rounded-xl border border-[#2A3A3A]/60">
                      <span className="text-[10px] text-slate-500 uppercase block font-bold">Expected Salary</span>
                      <span className="font-mono font-bold text-[#2DD4BF] text-sm">
                        {trainer.expectedSalary ? `₹${trainer.expectedSalary.toLocaleString()}/mo` : 'Negotiable'}
                      </span>
                    </div>
                    <div className="bg-[#141D1E]/60 p-2.5 rounded-xl border border-[#2A3A3A]/60">
                      <span className="text-[10px] text-slate-500 uppercase block font-bold">PT Fee Per Session</span>
                      <span className="font-mono font-bold text-slate-200 text-sm">
                        {trainer.personalTrainingFee || trainer.fee ? `₹${(trainer.personalTrainingFee || trainer.fee)?.toLocaleString()}` : 'Custom'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => setSelectedTrainer(trainer)}
                    className="flex-1 py-2.5 bg-[#141D1E] hover:bg-[#1B2728] text-white border border-[#2A3A3A] hover:border-[#2DD4BF]/50 font-bold text-xs rounded-xl transition-all text-center"
                  >
                    View Profile
                  </button>
                  <button
                    onClick={() => handleHireClick(trainer)}
                    className="flex-1 py-2.5 bg-[#2DD4BF] hover:bg-[#5EEAD4] text-black font-bold text-xs rounded-xl transition-all shadow-md shadow-[#2DD4BF]/20 flex items-center justify-center gap-1.5"
                  >
                    <Send size={13} />
                    <span>Hire Trainer</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* MODAL 1: DETAILED TRAINER PROFILE VIEW */}
      {selectedTrainer && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0E1415] border border-[#2DD4BF]/40 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-[#2A3A3A] pb-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-[#141D1E] border border-[#2A3A3A] shrink-0">
                  {selectedTrainer.profilePhoto ? (
                    <img src={selectedTrainer.profilePhoto} alt={selectedTrainer.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xl font-bold text-[#2DD4BF]">
                      {selectedTrainer.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedTrainer.name}</h3>
                  <p className="text-xs text-[#2DD4BF] font-semibold">
                    {selectedTrainer.professionalHeadline || selectedTrainer.specialization || 'Certified Coach'}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                    <span className="flex items-center gap-1 text-amber-400">
                      <Star size={12} fill="currentColor" /> {selectedTrainer.averageRating || 5.0}
                    </span>
                    <span>• {selectedTrainer.experience || 3}+ Years Exp</span>
                    <span>• {selectedTrainer.preferredLocation || 'India'}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedTrainer(null)}
                className="w-8 h-8 rounded-full bg-[#141D1E] hover:bg-[#1B2728] text-slate-400 hover:text-white flex items-center justify-center text-sm"
              >
                ✕
              </button>
            </div>

            {/* Compensation & Preferences Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#141D1E] p-4 rounded-2xl border border-[#2A3A3A]">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Monthly Salary</span>
                <span className="text-base font-bold font-mono text-[#2DD4BF]">
                  {selectedTrainer.expectedSalary ? `₹${selectedTrainer.expectedSalary.toLocaleString()}` : 'Negotiable'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">PT Per Session</span>
                <span className="text-base font-bold font-mono text-white">
                  {selectedTrainer.personalTrainingFee || selectedTrainer.fee ? `₹${(selectedTrainer.personalTrainingFee || selectedTrainer.fee)?.toLocaleString()}` : 'Custom'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Employment Type</span>
                <span className="text-xs font-bold text-slate-200">
                  {selectedTrainer.employmentPreference || 'Full-time'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Earliest Joining</span>
                <span className="text-xs font-bold text-emerald-400">
                  {selectedTrainer.earliestJoiningDate || 'Immediate'}
                </span>
              </div>
            </div>

            {/* Professional Biography */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#2DD4BF]">Professional Introduction</h4>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-[#141D1E]/40 p-4 rounded-2xl border border-[#2A3A3A]">
                {selectedTrainer.bio || 'Comprehensive fitness coach equipped with deep biomechanical knowledge, nutritional guidance, and motivation strategies.'}
              </p>
            </div>

            {/* Certifications & Qualifications */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#2DD4BF]">Certifications & Education</h4>
              <div className="bg-[#141D1E]/40 p-4 rounded-2xl border border-[#2A3A3A] space-y-2 text-xs text-slate-300">
                <div>
                  <strong className="text-white block mb-0.5">Accredited Certifications:</strong>
                  <span>{selectedTrainer.certifications || 'ACE, CSCS, CPR/AED Certified'}</span>
                </div>
                {selectedTrainer.qualifications && (
                  <div className="pt-2 border-t border-[#2A3A3A]">
                    <strong className="text-white block mb-0.5">Educational Background:</strong>
                    <span>{selectedTrainer.qualifications}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-[#2A3A3A] flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  const t = selectedTrainer;
                  setSelectedTrainer(null);
                  handleHireClick(t);
                }}
                className="flex-1 py-3 bg-[#2DD4BF] hover:bg-[#5EEAD4] text-black font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-[#2DD4BF]/25 flex items-center justify-center gap-2"
              >
                <Send size={15} />
                <span>Send Direct Hiring Request</span>
              </button>
              <button
                onClick={() => setSelectedTrainer(null)}
                className="px-6 py-3 bg-[#141D1E] text-slate-300 hover:text-white font-semibold text-xs rounded-xl border border-[#2A3A3A]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: SEND HIRING REQUEST FORM */}
      {hiringModalOpen && hiringTrainer && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0E1415] border border-[#2DD4BF]/40 rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#2A3A3A] pb-3">
              <div>
                <span className="text-[10px] font-bold text-[#2DD4BF] uppercase tracking-wider block">
                  OFFICIAL HIRING PROPOSAL
                </span>
                <h3 className="text-lg font-bold text-white">Send Hiring Request to {hiringTrainer.name}</h3>
              </div>
              <button onClick={() => setHiringModalOpen(false)} className="text-slate-400 hover:text-white text-sm">
                ✕
              </button>
            </div>

            {hiringSuccessMsg && (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 size={16} />
                <span>{hiringSuccessMsg}</span>
              </div>
            )}

            {hiringErrorMsg && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-400 text-xs font-bold">
                {hiringErrorMsg}
              </div>
            )}

            <form onSubmit={handleSendHiringRequest} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Trainer Position Role *</label>
                  <input
                    type="text"
                    required
                    value={hiringForm.role}
                    onChange={(e) => setHiringForm({ ...hiringForm, role: e.target.value })}
                    className="w-full bg-[#141D1E] border border-[#2A3A3A] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#2DD4BF]"
                    placeholder="e.g. Senior Strength Coach"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Employment Type *</label>
                  <select
                    value={hiringForm.employmentType}
                    onChange={(e) => setHiringForm({ ...hiringForm, employmentType: e.target.value as any })}
                    className="w-full bg-[#141D1E] border border-[#2A3A3A] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#2DD4BF]"
                  >
                    <option value="Full-time">Full-time (Salaried)</option>
                    <option value="Part-time">Part-time (Hourly/Shift)</option>
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
                    placeholder="45000"
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
                    placeholder="600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Working Hours / Schedule</label>
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
                <label className="text-slate-300 font-bold block mb-1">Personal Message to Candidate</label>
                <textarea
                  rows={2}
                  value={hiringForm.message}
                  onChange={(e) => setHiringForm({ ...hiringForm, message: e.target.value })}
                  className="w-full bg-[#141D1E] border border-[#2A3A3A] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#2DD4BF]"
                />
              </div>

              <div className="pt-3 border-t border-[#2A3A3A] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setHiringModalOpen(false)}
                  className="px-4 py-2.5 bg-[#141D1E] text-slate-400 hover:text-white rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingHiring}
                  className="px-6 py-2.5 bg-[#2DD4BF] hover:bg-[#5EEAD4] text-black font-bold rounded-xl transition-all shadow-md shadow-[#2DD4BF]/20 flex items-center gap-1.5 disabled:opacity-50"
                >
                  {submittingHiring ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      <span>Sending Proposal...</span>
                    </>
                  ) : (
                    <>
                      <Send size={13} />
                      <span>Dispatch Hiring Request</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
