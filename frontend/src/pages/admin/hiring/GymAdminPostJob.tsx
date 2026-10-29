import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../../../utils/api';
import { useAuth } from '../../../contexts/AuthContext';
import { 
  Briefcase, 
  ArrowLeft, 
  Save, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Building2, 
  IndianRupee, 
  Clock, 
  MapPin, 
  Dumbbell, 
  Calendar 
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

const GymAdminPostJob: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEdit);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [gymData, setGymData] = useState<any>(null);

  const [formData, setFormData] = useState({
    title: '',
    expertise: [] as string[],
    customExpertiseInput: '',
    description: '',
    responsibilities: '',
    experience: '1-2 Years',
    qualifications: '',
    certifications: '',
    salaryMin: '',
    salaryMax: '',
    salaryType: 'Monthly',
    isSalaryNegotiable: false,
    employmentType: 'Full-time',
    location: '',
    workingHours: '',
    vacanciesCount: 1,
    deadline: '',
    status: 'Published'
  });

  // Fetch gym profile to auto-populate gym name / location
  useEffect(() => {
    if (user?.gymId) {
      api.get(`/gyms/${user.gymId}`)
        .then(res => {
          if (res.data.gym) {
            setGymData(res.data.gym);
            if (!isEdit && !formData.location) {
              const loc = res.data.gym.location?.address || res.data.gym.location?.city || res.data.gym.address || '';
              setFormData(prev => ({ ...prev, location: loc }));
            }
          }
        })
        .catch(err => console.error('Failed to load gym data', err));
    }
  }, [user?.gymId]);

  // If edit mode, fetch existing vacancy details
  useEffect(() => {
    if (isEdit && id) {
      setFetchLoading(true);
      api.get(`/hiring/owner/jobs/${id}`)
        .then(res => {
          if (res.data.success && res.data.job) {
            const j = res.data.job;
            setFormData({
              title: j.title || '',
              expertise: j.expertise || [],
              customExpertiseInput: '',
              description: j.description || '',
              responsibilities: j.responsibilities || '',
              experience: j.experience || '1-2 Years',
              qualifications: j.qualifications || '',
              certifications: j.certifications || '',
              salaryMin: j.salaryMin ? String(j.salaryMin) : '',
              salaryMax: j.salaryMax ? String(j.salaryMax) : '',
              salaryType: j.salaryType || 'Monthly',
              isSalaryNegotiable: Boolean(j.isSalaryNegotiable),
              employmentType: j.employmentType || 'Full-time',
              location: j.location || '',
              workingHours: j.workingHours || '',
              vacanciesCount: j.vacanciesCount || 1,
              deadline: j.deadline ? new Date(j.deadline).toISOString().split('T')[0] : '',
              status: j.status || 'Published'
            });
          }
        })
        .catch(err => {
          console.error('Failed to load job', err);
          setError('Failed to load job vacancy details');
        })
        .finally(() => setFetchLoading(false));
    }
  }, [isEdit, id]);

  const toggleExpertise = (skill: string) => {
    setFormData(prev => {
      const exists = prev.expertise.includes(skill);
      return {
        ...prev,
        expertise: exists 
          ? prev.expertise.filter(s => s !== skill)
          : [...prev.expertise, skill]
      };
    });
  };

  const handleAddCustomExpertise = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && formData.customExpertiseInput.trim()) {
      e.preventDefault();
      const val = formData.customExpertiseInput.trim();
      if (!formData.expertise.includes(val)) {
        setFormData(prev => ({
          ...prev,
          expertise: [...prev.expertise, val],
          customExpertiseInput: ''
        }));
      }
    }
  };

  const handleSubmit = async (submitStatus: 'Draft' | 'Published') => {
    try {
      setError(null);
      setSuccess(null);

      if (!formData.title.trim()) {
        setError('Please enter a job title');
        return;
      }
      if (!formData.description.trim()) {
        setError('Please enter a job description');
        return;
      }
      if (!formData.location.trim()) {
        setError('Please enter a work location');
        return;
      }

      setLoading(true);

      const payload = {
        ...formData,
        status: submitStatus,
        salaryMin: formData.salaryMin ? Number(formData.salaryMin) : undefined,
        salaryMax: formData.salaryMax ? Number(formData.salaryMax) : undefined,
        vacanciesCount: Number(formData.vacanciesCount) || 1,
        deadline: formData.deadline ? new Date(formData.deadline) : undefined
      };

      if (isEdit) {
        const res = await api.put(`/hiring/owner/jobs/${id}`, payload);
        if (res.data.success) {
          setSuccess('Job vacancy updated successfully!');
          setTimeout(() => navigate('/admin/hiring/jobs'), 1200);
        }
      } else {
        const res = await api.post('/hiring/owner/jobs', payload);
        if (res.data.success) {
          setSuccess(submitStatus === 'Draft' ? 'Job saved as draft!' : 'Job vacancy published successfully!');
          setTimeout(() => navigate('/admin/hiring/jobs'), 1200);
        }
      }
    } catch (err: any) {
      console.error('Save error:', err);
      setError(err.response?.data?.message || 'Failed to save job vacancy');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="bg-[#141D1E] border border-[#2A3A3A] rounded-3xl p-16 text-center text-sm text-[#9AAEAE] flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-2 border-[#2DD4BF] border-t-transparent rounded-full animate-spin" />
        <span>Loading job vacancy details...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back & Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          to="/admin/hiring/jobs"
          className="text-xs font-bold text-[#9AAEAE] hover:text-[#2DD4BF] flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Back to Manage Vacancies</span>
        </Link>
        <span className="text-xs text-[#9AAEAE] font-mono">
          Gym: <span className="text-[#F5FAFA] font-bold">{gymData?.name || 'Your Gym'}</span>
        </span>
      </div>

      {/* Main Form Header Card */}
      <div className="bg-[#141D1E] border border-[#2A3A3A] rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="flex items-center gap-3.5 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-[#2DD4BF]/10 text-[#2DD4BF] flex items-center justify-center shrink-0 border border-[#2DD4BF]/20">
            <Briefcase size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#F5FAFA] tracking-tight">
              {isEdit ? 'Edit Trainer Vacancy' : 'Post a Trainer Job Vacancy'}
            </h1>
            <p className="text-xs text-[#9AAEAE] mt-0.5">
              Fill in the job details, qualifications, and salary expectations to attract certified coaches.
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3.5 rounded-xl bg-red-950/40 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mt-4 p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 size={16} className="shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <div className="mt-8 space-y-6">
          {/* 1. Basic Info Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#F5FAFA] mb-1.5">
                Job Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Senior Strength & Conditioning Coach"
                className="w-full px-4 py-2.5 bg-[#0E1415] border border-[#2A3A3A] rounded-xl text-xs text-[#F5FAFA] placeholder:text-[#9AAEAE]/50 focus:outline-none focus:border-[#2DD4BF]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#F5FAFA] mb-1.5">
                Gym / Facility Name
              </label>
              <div className="flex items-center gap-2 px-4 py-2.5 bg-[#0E1415]/70 border border-[#2A3A3A] rounded-xl text-xs text-[#9AAEAE]">
                <Building2 size={15} className="text-[#2DD4BF]" />
                <span className="font-semibold text-[#F5FAFA]">{gymData?.name || 'Auto-linked to Your Gym'}</span>
                <span className="text-[10px] ml-auto text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-bold">Verified Gym</span>
              </div>
            </div>
          </div>

          {/* 2. Employment Type, Required Experience & Vacancies */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#F5FAFA] mb-1.5">
                Employment Type <span className="text-red-400">*</span>
              </label>
              <select
                value={formData.employmentType}
                onChange={e => setFormData({ ...formData, employmentType: e.target.value as any })}
                className="w-full px-4 py-2.5 bg-[#0E1415] border border-[#2A3A3A] rounded-xl text-xs text-[#F5FAFA] focus:outline-none focus:border-[#2DD4BF]"
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#F5FAFA] mb-1.5">
                Required Experience <span className="text-red-400">*</span>
              </label>
              <select
                value={formData.experience}
                onChange={e => setFormData({ ...formData, experience: e.target.value })}
                className="w-full px-4 py-2.5 bg-[#0E1415] border border-[#2A3A3A] rounded-xl text-xs text-[#F5FAFA] focus:outline-none focus:border-[#2DD4BF]"
              >
                <option value="Fresher / Entry Level">Fresher / Entry Level</option>
                <option value="1-2 Years">1-2 Years</option>
                <option value="3-5 Years">3-5 Years</option>
                <option value="5-8 Years">5-8 Years</option>
                <option value="8+ Years (Master Trainer)">8+ Years (Master Trainer)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#F5FAFA] mb-1.5">
                Number of Vacancies <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={formData.vacanciesCount}
                onChange={e => setFormData({ ...formData, vacanciesCount: Math.max(1, parseInt(e.target.value) || 1) })}
                className="w-full px-4 py-2.5 bg-[#0E1415] border border-[#2A3A3A] rounded-xl text-xs text-[#F5FAFA] focus:outline-none focus:border-[#2DD4BF]"
              />
            </div>
          </div>

          {/* 3. Expertise & Coaching Domains */}
          <div>
            <label className="block text-xs font-bold text-[#F5FAFA] mb-1.5">
              Coaching Domains & Expertise
            </label>
            <p className="text-[11px] text-[#9AAEAE] mb-3">
              Select all specializations you are looking for in this trainer.
            </p>
            <div className="flex flex-wrap gap-2 mb-3">
              {COMMON_EXPERTISE.map((skill) => {
                const selected = formData.expertise.includes(skill);
                return (
                  <button
                    type="button"
                    key={skill}
                    onClick={() => toggleExpertise(skill)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                      selected
                        ? 'bg-[#2DD4BF] text-[#06201D] border-[#2DD4BF] shadow-sm shadow-teal-500/20'
                        : 'bg-[#0E1415] text-[#9AAEAE] hover:text-[#F5FAFA] border-[#2A3A3A] hover:border-[#2DD4BF]/40'
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
                value={formData.customExpertiseInput}
                onChange={e => setFormData({ ...formData, customExpertiseInput: e.target.value })}
                onKeyDown={handleAddCustomExpertise}
                placeholder="Type other custom skill and press Enter..."
                className="w-full max-w-sm px-3.5 py-2 bg-[#0E1415] border border-[#2A3A3A] rounded-xl text-xs text-[#F5FAFA] placeholder:text-[#9AAEAE]/50 focus:outline-none focus:border-[#2DD4BF]"
              />
            </div>
          </div>

          {/* 4. Compensation / Salary Range */}
          <div className="bg-[#0E1415] border border-[#2A3A3A] rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#F5FAFA] flex items-center gap-1.5">
                <IndianRupee size={15} className="text-[#2DD4BF]" />
                <span>Salary & Compensation Structure</span>
              </span>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.isSalaryNegotiable}
                  onChange={e => setFormData({ ...formData, isSalaryNegotiable: e.target.checked })}
                  className="rounded text-[#2DD4BF] focus:ring-0 bg-[#1B2728] border-[#2A3A3A]"
                />
                <span className="text-xs text-[#9AAEAE]">Negotiable for top candidates</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-[#9AAEAE] mb-1">Min Salary (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 25000"
                  value={formData.salaryMin}
                  onChange={e => setFormData({ ...formData, salaryMin: e.target.value })}
                  className="w-full px-3.5 py-2 bg-[#141D1E] border border-[#2A3A3A] rounded-xl text-xs text-[#F5FAFA] focus:outline-none focus:border-[#2DD4BF]"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#9AAEAE] mb-1">Max Salary (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 45000"
                  value={formData.salaryMax}
                  onChange={e => setFormData({ ...formData, salaryMax: e.target.value })}
                  className="w-full px-3.5 py-2 bg-[#141D1E] border border-[#2A3A3A] rounded-xl text-xs text-[#F5FAFA] focus:outline-none focus:border-[#2DD4BF]"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#9AAEAE] mb-1">Payment Frequency</label>
                <select
                  value={formData.salaryType}
                  onChange={e => setFormData({ ...formData, salaryType: e.target.value as any })}
                  className="w-full px-3.5 py-2 bg-[#141D1E] border border-[#2A3A3A] rounded-xl text-xs text-[#F5FAFA] focus:outline-none focus:border-[#2DD4BF]"
                >
                  <option value="Monthly">Per Month</option>
                  <option value="Hourly">Per Hour</option>
                  <option value="Per Session">Per Session</option>
                  <option value="Annual">Per Annum (CTC)</option>
                </select>
              </div>
            </div>
          </div>

          {/* 5. Location, Working Hours & Application Deadline */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#F5FAFA] mb-1.5 flex items-center gap-1.5">
                <MapPin size={13} className="text-[#2DD4BF]" /> Location <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={e => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. Indiranagar, Bangalore"
                className="w-full px-4 py-2.5 bg-[#0E1415] border border-[#2A3A3A] rounded-xl text-xs text-[#F5FAFA] focus:outline-none focus:border-[#2DD4BF]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#F5FAFA] mb-1.5 flex items-center gap-1.5">
                <Clock size={13} className="text-[#2DD4BF]" /> Working Hours / Shift
              </label>
              <input
                type="text"
                value={formData.workingHours}
                onChange={e => setFormData({ ...formData, workingHours: e.target.value })}
                placeholder="e.g. 6:00 AM - 2:00 PM or Flexible"
                className="w-full px-4 py-2.5 bg-[#0E1415] border border-[#2A3A3A] rounded-xl text-xs text-[#F5FAFA] focus:outline-none focus:border-[#2DD4BF]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#F5FAFA] mb-1.5 flex items-center gap-1.5">
                <Calendar size={13} className="text-[#2DD4BF]" /> Application Deadline
              </label>
              <input
                type="date"
                value={formData.deadline}
                onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                className="w-full px-4 py-2.5 bg-[#0E1415] border border-[#2A3A3A] rounded-xl text-xs text-[#F5FAFA] focus:outline-none focus:border-[#2DD4BF]"
              />
              {formData.deadline && new Date(formData.deadline).setHours(23, 59, 59, 999) < Date.now() ? (
                <p className="text-[11px] text-red-400 mt-1 flex items-center gap-1 font-semibold">
                  <AlertCircle size={12} /> Deadline expired: This job vacancy will be shown as over.
                </p>
              ) : (
                <p className="text-[10px] text-[#9AAEAE] mt-1">
                  Once this deadline is completed, the job vacancy will automatically be shown as over.
                </p>
              )}
            </div>
          </div>

          {/* 6. Job Description */}
          <div>
            <label className="block text-xs font-bold text-[#F5FAFA] mb-1.5">
              Job Description <span className="text-red-400">*</span>
            </label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="Provide a compelling overview of this role, the gym environment, and what makes your fitness community unique..."
              className="w-full px-4 py-3 bg-[#0E1415] border border-[#2A3A3A] rounded-xl text-xs text-[#F5FAFA] placeholder:text-[#9AAEAE]/50 focus:outline-none focus:border-[#2DD4BF] leading-relaxed"
              required
            />
          </div>

          {/* 7. Key Responsibilities */}
          <div>
            <label className="block text-xs font-bold text-[#F5FAFA] mb-1.5">
              Key Responsibilities
            </label>
            <textarea
              rows={3}
              value={formData.responsibilities}
              onChange={e => setFormData({ ...formData, responsibilities: e.target.value })}
              placeholder="e.g.
• Conduct client fitness assessments and 1-on-1 personal training sessions.
• Guide members on proper posture, breathing, and safe machine usage.
• Design customized strength and cardio programs using Gymora AI tools."
              className="w-full px-4 py-3 bg-[#0E1415] border border-[#2A3A3A] rounded-xl text-xs text-[#F5FAFA] placeholder:text-[#9AAEAE]/50 focus:outline-none focus:border-[#2DD4BF] leading-relaxed font-sans"
            />
          </div>

          {/* 8. Qualifications & Certifications */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#F5FAFA] mb-1.5">
                Required Qualifications
              </label>
              <input
                type="text"
                value={formData.qualifications}
                onChange={e => setFormData({ ...formData, qualifications: e.target.value })}
                placeholder="e.g. Degree in Physical Education or Sports Science"
                className="w-full px-4 py-2.5 bg-[#0E1415] border border-[#2A3A3A] rounded-xl text-xs text-[#F5FAFA] focus:outline-none focus:border-[#2DD4BF]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#F5FAFA] mb-1.5">
                Preferred Certifications
              </label>
              <input
                type="text"
                value={formData.certifications}
                onChange={e => setFormData({ ...formData, certifications: e.target.value })}
                placeholder="e.g. ACE, NASM, ISSA, CSCS, CPR / AED"
                className="w-full px-4 py-2.5 bg-[#0E1415] border border-[#2A3A3A] rounded-xl text-xs text-[#F5FAFA] focus:outline-none focus:border-[#2DD4BF]"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-6 border-t border-[#2A3A3A] flex flex-col sm:flex-row items-center justify-end gap-3">
            <Link
              to="/admin/hiring/jobs"
              className="w-full sm:w-auto px-5 py-2.5 bg-[#1B2728] hover:bg-[#2A3A3A] text-xs font-bold text-[#9AAEAE] hover:text-[#F5FAFA] rounded-xl transition-all text-center"
            >
              Cancel
            </Link>

            <button
              type="button"
              onClick={() => handleSubmit('Draft')}
              disabled={loading}
              className="w-full sm:w-auto px-5 py-2.5 bg-[#141D1E] hover:bg-[#1B2728] border border-[#2A3A3A] hover:border-[#2DD4BF]/50 text-xs font-bold text-[#F5FAFA] rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <Save size={15} className="text-[#2DD4BF]" />
              <span>Save as Draft</span>
            </button>

            <button
              type="button"
              onClick={() => handleSubmit('Published')}
              disabled={loading}
              className="w-full sm:w-auto px-7 py-2.5 bg-[#2DD4BF] hover:bg-[#5EEAD4] text-[#06201D] text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-[#06201D] border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send size={15} />
              )}
              <span>{isEdit ? 'Save & Update Vacancy' : 'Publish Vacancy Live'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GymAdminPostJob;
