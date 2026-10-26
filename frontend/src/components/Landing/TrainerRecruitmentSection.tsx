import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Briefcase,
  UserCheck,
  Search,
  MapPin,
  Clock,
  DollarSign,
  Award,
  GraduationCap,
  Calendar,
  ChevronRight,
  Filter,
  CheckCircle2,
  Sparkles,
  Building2,
  ArrowRight,
  ShieldCheck,
  ExternalLink,
  X,
  User,
  SlidersHorizontal,
  Info
} from 'lucide-react';
import api from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';

interface Trainer {
  _id: string;
  name: string;
  profilePhoto?: string;
  professionalHeadline?: string;
  specialization?: string;
  experience?: number;
  preferredLocation?: string;
  employmentPreference?: string;
  expectedSalary?: number;
  personalTrainingFee?: number;
  qualifications?: string;
  certifications?: string;
  expertise?: string;
  availabilityStatus?: string;
  earliestJoiningDate?: string;
  bio?: string;
  averageRating?: number;
}

interface JobVacancy {
  _id: string;
  title: string;
  gymName?: string;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryRange?: string;
  requiredExperience?: string | number;
  employmentType: string;
  createdAt: string;
  description?: string;
  responsibilities?: string[];
  qualifications?: string[];
  skills?: string[];
  status?: string;
}

const FALLBACK_TRAINERS: Trainer[] = [
  {
    _id: 'fb-t1',
    name: 'Vikramaditya Rao',
    profilePhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    professionalHeadline: 'Master CSCS Strength & Olympic Weightlifting Specialist',
    specialization: 'Strength & Conditioning',
    experience: 7,
    preferredLocation: 'Bangalore (Indiranagar / Koramangala)',
    employmentPreference: 'Full-time',
    expectedSalary: 65000,
    personalTrainingFee: 850,
    qualifications: 'B.Sc Sports Science, Biomechanics Certified',
    certifications: 'NSCA CSCS, USAW Level 2, CPR/AED',
    expertise: 'Powerlifting, Hypertrophy, Olympic Lifts',
    availabilityStatus: 'Available',
    earliestJoiningDate: 'Immediate',
    bio: '7+ years transforming collegiate athletes and elite gym members. Experienced in facility management and coaching rosters.',
    averageRating: 4.9
  },
  {
    _id: 'fb-t2',
    name: 'Ananya Sharma',
    profilePhoto: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    professionalHeadline: 'Functional Movement, HIIT & Women’s Strength Coach',
    specialization: 'Functional & HIIT',
    experience: 5,
    preferredLocation: 'Mumbai (Bandra / Andheri)',
    employmentPreference: 'Full-time / Contract',
    expectedSalary: 52000,
    personalTrainingFee: 700,
    qualifications: 'Kinesiology Diploma, Nutrition Certification',
    certifications: 'ACE Certified Personal Trainer, FMS Level 1',
    expertise: 'CrossFit, Core Stability, Fat Loss Conditioning',
    availabilityStatus: 'Available',
    earliestJoiningDate: 'Within 2 Weeks',
    bio: 'Passionate about injury prevention, mobility work, and high-energy group fitness conditioning.',
    averageRating: 4.8
  },
  {
    _id: 'fb-t3',
    name: 'Rohan Mehra',
    profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    professionalHeadline: 'Bodybuilding & Contest Prep Coach | Precision Nutritionist',
    specialization: 'Bodybuilding & Hypertrophy',
    experience: 8,
    preferredLocation: 'Delhi NCR (Gurugram / South Delhi)',
    employmentPreference: 'Full-time',
    expectedSalary: 75000,
    personalTrainingFee: 1000,
    qualifications: 'Sports Nutrition Specialist, Exercise Physiology',
    certifications: 'ISSA Master Trainer, Precision Nutrition Lv 1',
    expertise: 'Hypertrophy Protocols, Macro Coaching, Body Recomposition',
    availabilityStatus: 'Interviewing',
    earliestJoiningDate: '1 Month',
    bio: 'Coached over 200+ personal clients and 15 competitive physique athletes with meticulous tracking.',
    averageRating: 5.0
  },
  {
    _id: 'fb-t4',
    name: 'Pooja Hegde',
    profilePhoto: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
    professionalHeadline: 'Hatha Yoga Acharya, Mobility & Postural Rehab Specialist',
    specialization: 'Yoga & Mobility',
    experience: 6,
    preferredLocation: 'Hyderabad (Hitec City / Jubilee Hills)',
    employmentPreference: 'Part-time / Contract',
    expectedSalary: 40000,
    personalTrainingFee: 650,
    qualifications: '500-hr RYT Yoga Alliance, Postural Alignment',
    certifications: 'Yoga Alliance RYT 500, Functional Mobility (FRC)',
    expertise: 'Flexibility, Spine Rehabilitation, Breathwork & Mindfulness',
    availabilityStatus: 'Available',
    earliestJoiningDate: 'Immediate',
    bio: 'Bridging modern resistance training with ancient mobility principles for longevity and joint health.',
    averageRating: 4.9
  }
];

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
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'trainers' | 'jobs'>('trainers');

  // Trainers state
  const [trainers, setTrainers] = useState<Trainer[]>(FALLBACK_TRAINERS);
  const [loadingTrainers, setLoadingTrainers] = useState(false);
  const [trainerSearch, setTrainerSearch] = useState('');
  const [trainerLocation, setTrainerLocation] = useState('all');
  const [trainerExpertise, setTrainerExpertise] = useState('all');
  const [trainerExperience, setTrainerExperience] = useState('all');
  const [trainerEmployment, setTrainerEmployment] = useState('all');
  const [trainerSalary, setTrainerSalary] = useState('all');
  const [trainerAvailability, setTrainerAvailability] = useState('all');

  // Jobs state
  const [jobs, setJobs] = useState<JobVacancy[]>(FALLBACK_JOBS);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [jobSearch, setJobSearch] = useState('');
  const [jobLocation, setJobLocation] = useState('all');
  const [jobEmployment, setJobEmployment] = useState('all');

  // Modals
  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);
  const [selectedJob, setSelectedJob] = useState<JobVacancy | null>(null);

  useEffect(() => {
    // Fetch Public Trainers
    api
      .get('/hiring/public/trainers')
      .then((res) => {
        if (res.data?.success && res.data.trainers?.length > 0) {
          setTrainers(res.data.trainers);
        }
      })
      .catch((err) => {
        console.warn('Using fallback trainers data on landing page', err);
      });

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

  // Filter Trainers
  const filteredTrainers = trainers.filter((t) => {
    const term = trainerSearch.toLowerCase();
    const matchesSearch =
      !term ||
      t.name.toLowerCase().includes(term) ||
      (t.professionalHeadline && t.professionalHeadline.toLowerCase().includes(term)) ||
      (t.specialization && t.specialization.toLowerCase().includes(term)) ||
      (t.expertise && t.expertise.toLowerCase().includes(term));

    const matchesLocation =
      trainerLocation === 'all' ||
      (t.preferredLocation && t.preferredLocation.toLowerCase().includes(trainerLocation.toLowerCase()));

    const matchesExpertise =
      trainerExpertise === 'all' ||
      (t.specialization && t.specialization.toLowerCase().includes(trainerExpertise.toLowerCase()));

    const matchesExp =
      trainerExperience === 'all' ||
      (t.experience !== undefined && t.experience >= parseInt(trainerExperience, 10));

    const matchesEmp =
      trainerEmployment === 'all' ||
      (t.employmentPreference && t.employmentPreference.toLowerCase().includes(trainerEmployment.toLowerCase()));

    const matchesAvail =
      trainerAvailability === 'all' ||
      (t.availabilityStatus && t.availabilityStatus.toLowerCase() === trainerAvailability.toLowerCase());

    const salary = t.expectedSalary || 0;
    let matchesSalary = true;
    if (trainerSalary === 'under30k') matchesSalary = salary > 0 && salary <= 30000;
    else if (trainerSalary === '30k-50k') matchesSalary = salary >= 30000 && salary <= 50000;
    else if (trainerSalary === '50k-80k') matchesSalary = salary >= 50000 && salary <= 80000;
    else if (trainerSalary === 'above80k') matchesSalary = salary >= 80000;

    return (
      matchesSearch &&
      matchesLocation &&
      matchesExpertise &&
      matchesExp &&
      matchesEmp &&
      matchesSalary &&
      matchesAvail
    );
  });

  // Filter Jobs
  const filteredJobs = jobs.filter((j) => {
    const term = jobSearch.toLowerCase();
    const matchesSearch =
      !term ||
      j.title.toLowerCase().includes(term) ||
      (j.gymName && j.gymName.toLowerCase().includes(term)) ||
      (j.description && j.description.toLowerCase().includes(term));

    const matchesLocation =
      jobLocation === 'all' || (j.location && j.location.toLowerCase().includes(jobLocation.toLowerCase()));

    const matchesEmp =
      jobEmployment === 'all' ||
      (j.employmentType && j.employmentType.toLowerCase().includes(jobEmployment.toLowerCase()));

    return matchesSearch && matchesLocation && matchesEmp;
  });

  // Rules-based CTA Handlers
  const handleHireClick = (trainer: Trainer) => {
    if (!user) {
      // Direct visitor to login as gym owner or explore directory
      navigate('/login?portal=gym-owner');
      return;
    }
    if (user.role?.toUpperCase() === 'GYM_OWNER' || user.role?.toUpperCase() === 'ADMIN') {
      navigate('/admin/hiring/trainers');
    } else {
      alert('Only verified Gym Owners can send direct hiring requests. Please sign in with a Gym Owner account.');
    }
  };

  const handlePostJobClick = () => {
    if (!user) {
      navigate('/login?portal=gym-owner');
      return;
    }
    if (user.role?.toUpperCase() === 'GYM_OWNER' || user.role?.toUpperCase() === 'ADMIN') {
      navigate('/admin/hiring/jobs/new');
    } else {
      alert('Only verified Gym Owners can publish trainer vacancies. Please sign in with a Gym Owner account.');
    }
  };

  const handleApplyClick = (job: JobVacancy) => {
    if (!user) {
      // Require trainer authentication before submitting an application
      navigate('/login?portal=trainer');
      return;
    }
    if (user.role?.toUpperCase() === 'TRAINER') {
      navigate('/trainer/jobs');
    } else {
      alert('Please log in with a Trainer account to apply for coaching vacancies.');
    }
  };

  return (
    <section className="border-t border-[#2A3A3A] bg-[#080B0C] py-24 relative overflow-hidden" id="recruitment-hub">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[#2DD4BF]/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="px-3.5 py-1.5 rounded-full bg-[#2DD4BF]/10 border border-[#2DD4BF]/25 text-[#2DD4BF] text-xs font-semibold inline-flex items-center gap-1.5 mb-4">
            <Sparkles size={13} />
            <span>Recruitment & Hiring Engine</span>
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#F5FAFA] tracking-tight mb-4">
            Trainer Recruitment & Gym Careers
          </h2>
          <p className="text-sm sm:text-base text-[#9AAEAE] leading-relaxed">
            Discover verified personal trainers, functional coaches, and group instructors—or browse active coaching vacancies published by top fitness centers nationwide.
          </p>

          {/* 4 Main Action CTAs as required by Section 1 */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
            <button
              onClick={() => setActiveTab('trainers')}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 ${
                activeTab === 'trainers'
                  ? 'bg-[#2DD4BF] text-black shadow-lg shadow-[#2DD4BF]/25'
                  : 'bg-[#141D1E] text-slate-300 hover:text-white border border-[#2A3A3A]'
              }`}
            >
              <UserCheck size={16} />
              <span>Explore Trainers</span>
            </button>

            <button
              onClick={() => setActiveTab('jobs')}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 ${
                activeTab === 'jobs'
                  ? 'bg-[#2DD4BF] text-black shadow-lg shadow-[#2DD4BF]/25'
                  : 'bg-[#141D1E] text-slate-300 hover:text-white border border-[#2A3A3A]'
              }`}
            >
              <Briefcase size={16} />
              <span>Find Gym Jobs</span>
            </button>

            <button
              onClick={handlePostJobClick}
              className="px-5 py-2.5 bg-[#141D1E] hover:bg-[#1B2728] text-white font-semibold rounded-xl text-xs sm:text-sm border border-[#2DD4BF]/40 transition-all flex items-center gap-2"
            >
              <Building2 size={16} className="text-[#2DD4BF]" />
              <span>Post a Trainer Job</span>
              <span className="text-[9px] bg-[#2DD4BF]/15 text-[#2DD4BF] px-1.5 py-0.5 rounded font-bold uppercase">
                Owner
              </span>
            </button>

            <Link
              to="/trainers"
              className="px-5 py-2.5 bg-gradient-to-r from-teal-500/20 to-teal-400/10 hover:from-teal-500/30 text-teal-200 font-semibold rounded-xl text-xs sm:text-sm border border-teal-500/40 transition-all flex items-center gap-2"
            >
              <Search size={16} className="text-[#2DD4BF]" />
              <span>Hire a Trainer</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TAB A: EXPLORE TRAINERS */}
        {/* ========================================================================= */}
        {activeTab === 'trainers' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Filter Bar */}
            <div className="bg-[#0E1415] border border-[#2A3A3A] rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
              <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
                {/* Search */}
                <div className="relative w-full md:w-96">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by trainer name, headline, or expertise..."
                    value={trainerSearch}
                    onChange={(e) => setTrainerSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-[#141D1E] border border-[#2A3A3A] rounded-xl text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-[#2DD4BF]"
                  />
                </div>

                <div className="flex items-center gap-2 self-start md:self-auto text-xs text-slate-400">
                  <span className="font-semibold text-white font-mono">{filteredTrainers.length}</span> verified coaches available
                </div>
              </div>

              {/* Multi-Filters Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-2 border-t border-[#2A3A3A]/60">
                {/* Location */}
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                    Location
                  </label>
                  <select
                    value={trainerLocation}
                    onChange={(e) => setTrainerLocation(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-[#141D1E] border border-[#2A3A3A] rounded-lg text-white text-xs focus:border-[#2DD4BF] focus:outline-none"
                  >
                    <option value="all">All Locations</option>
                    <option value="bangalore">Bangalore</option>
                    <option value="mumbai">Mumbai</option>
                    <option value="delhi">Delhi NCR</option>
                    <option value="hyderabad">Hyderabad</option>
                    <option value="pune">Pune</option>
                    <option value="chennai">Chennai</option>
                  </select>
                </div>

                {/* Specialization */}
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                    Expertise
                  </label>
                  <select
                    value={trainerExpertise}
                    onChange={(e) => setTrainerExpertise(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-[#141D1E] border border-[#2A3A3A] rounded-lg text-white text-xs focus:border-[#2DD4BF] focus:outline-none"
                  >
                    <option value="all">All Specialties</option>
                    <option value="strength">Strength & Conditioning</option>
                    <option value="functional">Functional & HIIT</option>
                    <option value="bodybuilding">Bodybuilding</option>
                    <option value="yoga">Yoga & Mobility</option>
                  </select>
                </div>

                {/* Experience */}
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                    Experience
                  </label>
                  <select
                    value={trainerExperience}
                    onChange={(e) => setTrainerExperience(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-[#141D1E] border border-[#2A3A3A] rounded-lg text-white text-xs focus:border-[#2DD4BF] focus:outline-none"
                  >
                    <option value="all">Any Experience</option>
                    <option value="2">2+ Years</option>
                    <option value="5">5+ Years</option>
                    <option value="8">8+ Years</option>
                  </select>
                </div>

                {/* Employment Preference */}
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                    Employment
                  </label>
                  <select
                    value={trainerEmployment}
                    onChange={(e) => setTrainerEmployment(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-[#141D1E] border border-[#2A3A3A] rounded-lg text-white text-xs focus:border-[#2DD4BF] focus:outline-none"
                  >
                    <option value="all">All Types</option>
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="contract">Contract</option>
                  </select>
                </div>

                {/* Expected Monthly Salary */}
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                    Expected Salary
                  </label>
                  <select
                    value={trainerSalary}
                    onChange={(e) => setTrainerSalary(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-[#141D1E] border border-[#2A3A3A] rounded-lg text-white text-xs focus:border-[#2DD4BF] focus:outline-none"
                  >
                    <option value="all">All Salaries</option>
                    <option value="under30k">Under ₹30,000</option>
                    <option value="30k-50k">₹30,000 - ₹50,000</option>
                    <option value="50k-80k">₹50,000 - ₹80,000</option>
                    <option value="above80k">Above ₹80,000</option>
                  </select>
                </div>

                {/* Availability */}
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                    Availability
                  </label>
                  <select
                    value={trainerAvailability}
                    onChange={(e) => setTrainerAvailability(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-[#141D1E] border border-[#2A3A3A] rounded-lg text-white text-xs focus:border-[#2DD4BF] focus:outline-none"
                  >
                    <option value="all">All Status</option>
                    <option value="available">Available</option>
                    <option value="interviewing">Interviewing</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Trainer Cards Grid */}
            {filteredTrainers.length === 0 ? (
              <div className="p-16 text-center bg-[#0E1415] rounded-2xl border border-[#2A3A3A]">
                <User className="w-12 h-12 text-[#2DD4BF]/40 mx-auto mb-3" />
                <h3 className="text-base font-bold text-white mb-1">No coaches found matching your criteria</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
                  Try adjusting your filters or search keywords to browse our public trainer network.
                </p>
                <button
                  onClick={() => {
                    setTrainerSearch('');
                    setTrainerLocation('all');
                    setTrainerExpertise('all');
                    setTrainerExperience('all');
                    setTrainerEmployment('all');
                    setTrainerSalary('all');
                    setTrainerAvailability('all');
                  }}
                  className="px-4 py-2 bg-[#141D1E] text-slate-300 text-xs font-semibold rounded-xl border border-[#2A3A3A]"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5">
                {filteredTrainers.map((trainer) => (
                  <div
                    key={trainer._id}
                    className="bg-[#0E1415] border border-[#2A3A3A] hover:border-[#2DD4BF]/60 rounded-2xl p-5 sm:p-6 transition-all flex flex-col justify-between space-y-4 group shadow-md hover:shadow-teal-500/5"
                  >
                    <div>
                      {/* Top Row: Photo + Name + Headline + Status */}
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-[#141D1E] border border-[#2A3A3A] flex items-center justify-center text-xl font-bold text-[#2DD4BF] overflow-hidden shrink-0 group-hover:scale-105 transition-transform">
                          {trainer.profilePhoto ? (
                            <img
                              src={trainer.profilePhoto}
                              alt={trainer.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            trainer.name[0]?.toUpperCase() || 'T'
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="text-base sm:text-lg font-bold text-white truncate flex items-center gap-1.5">
                              {trainer.name}
                              <ShieldCheck className="w-4 h-4 text-[#2DD4BF] shrink-0" />
                            </h3>
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider shrink-0">
                              {trainer.availabilityStatus || 'Available'}
                            </span>
                          </div>

                          <p className="text-xs text-[#2DD4BF] font-medium line-clamp-1 mt-0.5">
                            {trainer.professionalHeadline || trainer.specialization || 'Certified Fitness Coach'}
                          </p>

                          <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-400 flex-wrap">
                            <span className="px-2 py-0.5 rounded-md bg-[#141D1E] border border-[#2A3A3A] text-slate-300 font-semibold">
                              {trainer.experience || 3}+ Yrs Experience
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-500" />
                              {trainer.preferredLocation || 'India'}
                            </span>
                            <span>•</span>
                            <span>{trainer.employmentPreference || 'Full-time'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Compensation Breakdown (Strict distinction between Monthly Salary vs PT Fee) */}
                      <div className="grid grid-cols-2 gap-3 bg-[#141D1E] p-3 rounded-xl border border-[#2A3A3A] mt-4">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                            Expected Monthly Salary
                          </span>
                          <span className="text-sm sm:text-base font-bold text-white font-mono mt-0.5 block">
                            {trainer.expectedSalary ? `₹${trainer.expectedSalary.toLocaleString()}` : 'Negotiable'}
                            <span className="text-[10px] text-slate-400 font-normal"> /mo</span>
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                            Personal Training Fee
                          </span>
                          <span className="text-sm sm:text-base font-bold text-[#2DD4BF] font-mono mt-0.5 block">
                            {trainer.personalTrainingFee ? `₹${trainer.personalTrainingFee.toLocaleString()}` : 'Custom'}
                            <span className="text-[10px] text-slate-400 font-normal"> /session</span>
                          </span>
                        </div>
                      </div>

                      {/* Credentials & Qualifications summary */}
                      <div className="mt-3.5 space-y-1.5 text-xs text-slate-300">
                        {trainer.qualifications && (
                          <div className="flex items-start gap-1.5">
                            <GraduationCap className="w-3.5 h-3.5 text-[#2DD4BF] shrink-0 mt-0.5" />
                            <span className="line-clamp-1">{trainer.qualifications}</span>
                          </div>
                        )}
                        {trainer.certifications && (
                          <div className="flex items-start gap-1.5">
                            <Award className="w-3.5 h-3.5 text-[#2DD4BF] shrink-0 mt-0.5" />
                            <span className="line-clamp-1">{trainer.certifications}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2.5 pt-3 border-t border-[#2A3A3A]">
                      <button
                        onClick={() => setSelectedTrainer(trainer)}
                        className="flex-1 py-2 bg-[#141D1E] hover:bg-[#1B2728] text-slate-300 hover:text-white rounded-xl text-xs font-semibold border border-[#2A3A3A] transition-all flex items-center justify-center gap-1.5"
                      >
                        <User className="w-3.5 h-3.5 text-[#2DD4BF]" />
                        View Profile
                      </button>

                      <button
                        onClick={() => handleHireClick(trainer)}
                        className="flex-1 py-2 bg-[#2DD4BF] hover:bg-[#5EEAD4] text-black font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-md shadow-[#2DD4BF]/20"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        Hire Trainer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Bottom Directory Link */}
            <div className="pt-4 text-center">
              <Link
                to="/trainers"
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#2DD4BF] hover:underline"
              >
                <span>Browse the complete public directory of certified personal trainers</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB B: FIND GYM JOBS */}
        {/* ========================================================================= */}
        {activeTab === 'jobs' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Filter Bar */}
            <div className="bg-[#0E1415] border border-[#2A3A3A] rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
              <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
                <div className="relative w-full md:w-96">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by job title, gym name, or keywords..."
                    value={jobSearch}
                    onChange={(e) => setJobSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-[#141D1E] border border-[#2A3A3A] rounded-xl text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-[#2DD4BF]"
                  />
                </div>

                <div className="flex items-center gap-2 self-start md:self-auto text-xs text-slate-400">
                  <span className="font-semibold text-white font-mono">{filteredJobs.length}</span> active vacancies
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#2A3A3A]/60">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                    Location
                  </label>
                  <select
                    value={jobLocation}
                    onChange={(e) => setJobLocation(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-[#141D1E] border border-[#2A3A3A] rounded-lg text-white text-xs focus:border-[#2DD4BF] focus:outline-none"
                  >
                    <option value="all">All Locations</option>
                    <option value="bangalore">Bangalore</option>
                    <option value="mumbai">Mumbai</option>
                    <option value="gurugram">Gurugram / Delhi NCR</option>
                    <option value="hyderabad">Hyderabad</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                    Employment Type
                  </label>
                  <select
                    value={jobEmployment}
                    onChange={(e) => setJobEmployment(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-[#141D1E] border border-[#2A3A3A] rounded-lg text-white text-xs focus:border-[#2DD4BF] focus:outline-none"
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
              <div className="p-16 text-center bg-[#0E1415] rounded-2xl border border-[#2A3A3A]">
                <Briefcase className="w-12 h-12 text-[#2DD4BF]/40 mx-auto mb-3" />
                <h3 className="text-base font-bold text-white mb-1">No vacancies found matching your search</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
                  Check back soon as new gym coaching roles are posted regularly by verified gym owners.
                </p>
                <button
                  onClick={() => {
                    setJobSearch('');
                    setJobLocation('all');
                    setJobEmployment('all');
                  }}
                  className="px-4 py-2 bg-[#141D1E] text-slate-300 text-xs font-semibold rounded-xl border border-[#2A3A3A]"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredJobs.map((job) => (
                  <div
                    key={job._id}
                    className="bg-[#0E1415] border border-[#2A3A3A] hover:border-[#2DD4BF]/50 rounded-2xl p-5 sm:p-6 transition-all flex flex-col md:flex-row md:items-center justify-between gap-5 group"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-[#2DD4BF] transition-colors">
                          {job.title}
                        </h3>
                        <span className="px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/30 text-[10px] font-bold uppercase tracking-wider">
                          {job.employmentType}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
                        <span className="font-semibold text-white flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-[#2DD4BF]" />
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
                        <span className="px-2 py-0.5 bg-[#141D1E] border border-[#2A3A3A] rounded-md text-[#2DD4BF] font-mono font-bold">
                          {job.salaryRange || `₹${job.salaryMin?.toLocaleString()} - ₹${job.salaryMax?.toLocaleString()} / mo`}
                        </span>
                        <span className="px-2 py-0.5 bg-[#141D1E] border border-[#2A3A3A] rounded-md text-slate-300">
                          Exp: {job.requiredExperience || '1+ Year'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      <button
                        onClick={() => setSelectedJob(job)}
                        className="px-4 py-2 bg-[#141D1E] hover:bg-[#1B2728] text-slate-300 hover:text-white rounded-xl text-xs font-semibold border border-[#2A3A3A] transition-all"
                      >
                        View Vacancy Details
                      </button>

                      <button
                        onClick={() => handleApplyClick(job)}
                        className="px-5 py-2 bg-[#2DD4BF] hover:bg-[#5EEAD4] text-black font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-md shadow-[#2DD4BF]/20"
                      >
                        <Briefcase className="w-3.5 h-3.5" />
                        Apply Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Bottom Jobs Link */}
            <div className="pt-4 text-center">
              <Link
                to="/careers"
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#2DD4BF] hover:underline"
              >
                <span>View all active gym job listings on our Careers board</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* PUBLIC TRAINER PROFILE MODAL */}
      {/* ========================================================================= */}
      {selectedTrainer && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0E1415] border border-[#2A3A3A] rounded-2xl max-w-2xl w-full p-6 text-white shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-4 border-b border-[#2A3A3A] gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-[#141D1E] border border-[#2A3A3A] flex items-center justify-center text-2xl font-bold text-[#2DD4BF] overflow-hidden shrink-0">
                  {selectedTrainer.profilePhoto ? (
                    <img
                      src={selectedTrainer.profilePhoto}
                      alt={selectedTrainer.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    selectedTrainer.name[0]?.toUpperCase() || 'T'
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    {selectedTrainer.name}
                    <ShieldCheck className="w-5 h-5 text-[#2DD4BF]" />
                  </h3>
                  <p className="text-xs text-[#2DD4BF] font-medium mt-0.5">
                    {selectedTrainer.professionalHeadline || selectedTrainer.specialization}
                  </p>
                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    {selectedTrainer.preferredLocation || 'India'} • {selectedTrainer.employmentPreference || 'Full-time'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedTrainer(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4 py-4 text-xs">
              {/* Compensation Breakdown */}
              <div className="grid grid-cols-2 gap-3 bg-[#141D1E] p-4 rounded-xl border border-[#2A3A3A]">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                    Expected Monthly Salary
                  </span>
                  <span className="text-base font-bold text-white font-mono mt-0.5 block">
                    {selectedTrainer.expectedSalary ? `₹${selectedTrainer.expectedSalary.toLocaleString()}` : 'Negotiable'}
                    <span className="text-xs text-slate-400 font-normal"> / month</span>
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                    Per-Session PT Fee
                  </span>
                  <span className="text-base font-bold text-[#2DD4BF] font-mono mt-0.5 block">
                    {selectedTrainer.personalTrainingFee ? `₹${selectedTrainer.personalTrainingFee.toLocaleString()}` : 'Negotiable'}
                    <span className="text-xs text-slate-400 font-normal"> / session</span>
                  </span>
                </div>
              </div>

              {/* Bio */}
              {selectedTrainer.bio && (
                <div>
                  <h4 className="font-bold text-slate-300 uppercase text-[10px] tracking-wider mb-1">
                    Professional Introduction
                  </h4>
                  <p className="bg-[#141D1E] p-3 rounded-xl border border-[#2A3A3A] text-slate-300 leading-relaxed">
                    {selectedTrainer.bio}
                  </p>
                </div>
              )}

              {/* Qualifications & Certs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedTrainer.qualifications && (
                  <div className="bg-[#141D1E] p-3 rounded-xl border border-[#2A3A3A]">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Education & Degree
                    </span>
                    <span className="text-slate-200 font-medium">{selectedTrainer.qualifications}</span>
                  </div>
                )}
                {selectedTrainer.certifications && (
                  <div className="bg-[#141D1E] p-3 rounded-xl border border-[#2A3A3A]">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Certifications
                    </span>
                    <span className="text-[#2DD4BF] font-medium">{selectedTrainer.certifications}</span>
                  </div>
                )}
              </div>

              {/* Availability Notice */}
              <div className="p-3 bg-teal-500/10 border border-teal-500/20 rounded-xl text-teal-300 flex items-center justify-between">
                <span>Earliest Joining Availability:</span>
                <span className="font-bold text-white">{selectedTrainer.earliestJoiningDate || 'Immediate'}</span>
              </div>

              {/* Privacy Notice */}
              <p className="text-[10px] text-slate-500 italic">
                * Note: In compliance with privacy standards, candidate phone numbers and direct contact details are accessible exclusively through authorized Gym Owner direct hiring requests.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#2A3A3A]">
              <button
                onClick={() => setSelectedTrainer(null)}
                className="px-4 py-2 bg-[#141D1E] text-slate-300 rounded-xl text-xs font-semibold hover:bg-[#1B2728]"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const t = selectedTrainer;
                  setSelectedTrainer(null);
                  handleHireClick(t);
                }}
                className="px-5 py-2.5 bg-[#2DD4BF] hover:bg-[#5EEAD4] text-black font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-[#2DD4BF]/20"
              >
                <UserCheck className="w-4 h-4" />
                Send Hiring Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PUBLIC JOB VACANCY MODAL */}
      {/* ========================================================================= */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0E1415] border border-[#2A3A3A] rounded-2xl max-w-2xl w-full p-6 text-white shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-4 border-b border-[#2A3A3A]">
              <div>
                <h3 className="text-xl font-bold text-white">{selectedJob.title}</h3>
                <p className="text-xs text-[#2DD4BF] font-semibold mt-1">
                  {selectedJob.gymName} • {selectedJob.location}
                </p>
              </div>
              <button onClick={() => setSelectedJob(null)} className="text-slate-400 hover:text-white p-1">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4 py-4 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-[#141D1E] p-4 rounded-xl border border-[#2A3A3A]">
                <div>
                  <span className="text-slate-500 block">Offered Compensation</span>
                  <span className="font-bold text-[#2DD4BF] text-sm mt-0.5 block">
                    {selectedJob.salaryRange || `₹${selectedJob.salaryMin?.toLocaleString()} - ₹${selectedJob.salaryMax?.toLocaleString()}`}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Employment Type</span>
                  <span className="font-semibold text-white mt-0.5 block">{selectedJob.employmentType}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Experience Required</span>
                  <span className="font-semibold text-white mt-0.5 block">{selectedJob.requiredExperience || '1+ Year'}</span>
                </div>
              </div>

              {selectedJob.description && (
                <div>
                  <h4 className="font-bold text-slate-300 uppercase text-[10px] tracking-wider mb-1">
                    Job Description
                  </h4>
                  <p className="bg-[#141D1E] p-3 rounded-xl border border-[#2A3A3A] text-slate-300 leading-relaxed">
                    {selectedJob.description}
                  </p>
                </div>
              )}

              {selectedJob.responsibilities && selectedJob.responsibilities.length > 0 && (
                <div>
                  <h4 className="font-bold text-slate-300 uppercase text-[10px] tracking-wider mb-1">
                    Key Responsibilities
                  </h4>
                  <ul className="bg-[#141D1E] p-3 rounded-xl border border-[#2A3A3A] text-slate-300 space-y-1.5 list-disc pl-5">
                    {selectedJob.responsibilities.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedJob.qualifications && selectedJob.qualifications.length > 0 && (
                <div>
                  <h4 className="font-bold text-slate-300 uppercase text-[10px] tracking-wider mb-1">
                    Qualifications & Certifications
                  </h4>
                  <ul className="bg-[#141D1E] p-3 rounded-xl border border-[#2A3A3A] text-slate-300 space-y-1.5 list-disc pl-5">
                    {selectedJob.qualifications.map((q, i) => (
                      <li key={i}>{q}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#2A3A3A]">
              <button
                onClick={() => setSelectedJob(null)}
                className="px-4 py-2 bg-[#141D1E] text-slate-300 rounded-xl text-xs font-semibold hover:bg-[#1B2728]"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const j = selectedJob;
                  setSelectedJob(null);
                  handleApplyClick(j);
                }}
                className="px-5 py-2.5 bg-[#2DD4BF] hover:bg-[#5EEAD4] text-black font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-[#2DD4BF]/20"
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
