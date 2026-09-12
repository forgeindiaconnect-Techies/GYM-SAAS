import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, UploadCloud, Save, CheckCircle2, User, Briefcase, FileText } from 'lucide-react';
import api from '../../utils/api';

const AdminAddTrainer = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    dateOfBirth: '',
    gender: '',
    specialization: '',
    experienceYears: '',
    qualification: '',
    certifications: '',
    previousGym: '',
    joiningDate: '',
    employmentType: '',
    workingDays: '',
    workingHours: '',
    salary: '',
    bio: '',
  });

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent, status: 'PENDING' | 'APPROVED') => {
    e.preventDefault();
    setError('');

    // Basic Validation
    if (!form.firstName || !form.lastName || !form.email || !form.mobile || !form.specialization || !form.experienceYears || !form.joiningDate || !form.employmentType) {
      setError('Please fill in all required fields marked with *');
      window.scrollTo(0, 0);
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        ...form,
        experienceYears: Number(form.experienceYears),
        approvalStatus: status,
        isActive: status === 'APPROVED'
      };

      await api.post('/trainers', payload);
      navigate('/admin/trainers');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create trainer');
      window.scrollTo(0, 0);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div className="flex items-center space-x-4">
        <Link to="/admin/trainers" className="p-2 bg-[#FFFFFF] hover:bg-[#E2E8F0] rounded-xl transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Add New Trainer</h1>
          <p className="text-[#475569] text-sm">Register and hire a new fitness professional</p>
        </div>
      </div>

      {error && (
        <div className="bg-[#0D9488]/10 border border-[#0D9488]/30 text-teal-400 p-4 rounded-xl text-sm">
          {error}
        </div>
      )}

      <form className="space-y-8">
        
        {/* Personal Information */}
        <section className="bg-[#FFFFFF] border border-[#CCFBF1] rounded-2xl p-6 md:p-8">
          <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-[#CCFBF1]">
            <User className="text-[#16A34A]" size={24} />
            <h2 className="text-xl font-bold">Personal Information</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-[#475569] mb-2">First Name *</label>
              <input type="text" name="firstName" value={form.firstName} onChange={handleChange} className="w-full bg-[#FFFFFF] border border-[#CCFBF1] rounded-xl px-4 py-3 text-sm focus:border-[#16A34A] outline-none transition-colors" placeholder="John" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#475569] mb-2">Last Name *</label>
              <input type="text" name="lastName" value={form.lastName} onChange={handleChange} className="w-full bg-[#FFFFFF] border border-[#CCFBF1] rounded-xl px-4 py-3 text-sm focus:border-[#16A34A] outline-none transition-colors" placeholder="Doe" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#475569] mb-2">Email Address *</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} className="w-full bg-[#FFFFFF] border border-[#CCFBF1] rounded-xl px-4 py-3 text-sm focus:border-[#16A34A] outline-none transition-colors" placeholder="john@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#475569] mb-2">Phone Number *</label>
              <input type="tel" name="mobile" value={form.mobile} onChange={handleChange} className="w-full bg-[#FFFFFF] border border-[#CCFBF1] rounded-xl px-4 py-3 text-sm focus:border-[#16A34A] outline-none transition-colors" placeholder="+1 234 567 8900" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#475569] mb-2">Date of Birth</label>
              <input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} className="w-full bg-[#FFFFFF] border border-[#CCFBF1] rounded-xl px-4 py-3 text-sm focus:border-[#16A34A] outline-none transition-colors [color-scheme:dark]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#475569] mb-2">Gender</label>
              <select name="gender" value={form.gender} onChange={handleChange} className="w-full bg-[#FFFFFF] border border-[#CCFBF1] rounded-xl px-4 py-3 text-sm focus:border-[#16A34A] outline-none transition-colors appearance-none">
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </section>

        {/* Professional Information */}
        <section className="bg-[#FFFFFF] border border-[#CCFBF1] rounded-2xl p-6 md:p-8">
          <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-[#CCFBF1]">
            <Briefcase className="text-[#16A34A]" size={24} />
            <h2 className="text-xl font-bold">Professional Information</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-[#475569] mb-2">Specialization *</label>
              <select name="specialization" value={form.specialization} onChange={handleChange} className="w-full bg-[#FFFFFF] border border-[#CCFBF1] rounded-xl px-4 py-3 text-sm focus:border-[#16A34A] outline-none transition-colors appearance-none">
                <option value="">Select Specialization</option>
                <option value="Personal Trainer">Personal Trainer</option>
                <option value="Fitness Trainer">Fitness Trainer</option>
                <option value="Yoga Trainer">Yoga Trainer</option>
                <option value="Strength & Conditioning">Strength & Conditioning</option>
                <option value="Cardio Trainer">Cardio Trainer</option>
                <option value="Nutrition & Fitness Coach">Nutrition & Fitness Coach</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#475569] mb-2">Experience (Years) *</label>
              <input type="number" name="experienceYears" value={form.experienceYears} onChange={handleChange} min="0" className="w-full bg-[#FFFFFF] border border-[#CCFBF1] rounded-xl px-4 py-3 text-sm focus:border-[#16A34A] outline-none transition-colors" placeholder="e.g. 5" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#475569] mb-2">Qualification</label>
              <input type="text" name="qualification" value={form.qualification} onChange={handleChange} className="w-full bg-[#FFFFFF] border border-[#CCFBF1] rounded-xl px-4 py-3 text-sm focus:border-[#16A34A] outline-none transition-colors" placeholder="e.g. B.Sc Sports Science" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#475569] mb-2">Certifications</label>
              <input type="text" name="certifications" value={form.certifications} onChange={handleChange} className="w-full bg-[#FFFFFF] border border-[#CCFBF1] rounded-xl px-4 py-3 text-sm focus:border-[#16A34A] outline-none transition-colors" placeholder="e.g. ACE, NASM" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#475569] mb-2">Previous Gym / Organization</label>
              <input type="text" name="previousGym" value={form.previousGym} onChange={handleChange} className="w-full bg-[#FFFFFF] border border-[#CCFBF1] rounded-xl px-4 py-3 text-sm focus:border-[#16A34A] outline-none transition-colors" placeholder="Where did they work previously?" />
            </div>
          </div>
        </section>

        {/* Employment Information */}
        <section className="bg-[#FFFFFF] border border-[#CCFBF1] rounded-2xl p-6 md:p-8">
          <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-[#CCFBF1]">
            <FileText className="text-[#16A34A]" size={24} />
            <h2 className="text-xl font-bold">Employment Details</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-[#475569] mb-2">Joining Date *</label>
              <input type="date" name="joiningDate" value={form.joiningDate} onChange={handleChange} className="w-full bg-[#FFFFFF] border border-[#CCFBF1] rounded-xl px-4 py-3 text-sm focus:border-[#16A34A] outline-none transition-colors [color-scheme:dark]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#475569] mb-2">Employment Type *</label>
              <select name="employmentType" value={form.employmentType} onChange={handleChange} className="w-full bg-[#FFFFFF] border border-[#CCFBF1] rounded-xl px-4 py-3 text-sm focus:border-[#16A34A] outline-none transition-colors appearance-none">
                <option value="">Select Type</option>
                <option value="Full-Time">Full-Time</option>
                <option value="Part-Time">Part-Time</option>
                <option value="Contract">Contract</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#475569] mb-2">Working Days</label>
              <input type="text" name="workingDays" value={form.workingDays} onChange={handleChange} className="w-full bg-[#FFFFFF] border border-[#CCFBF1] rounded-xl px-4 py-3 text-sm focus:border-[#16A34A] outline-none transition-colors" placeholder="e.g. Mon-Fri" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#475569] mb-2">Available Shift / Hours</label>
              <input type="text" name="workingHours" value={form.workingHours} onChange={handleChange} className="w-full bg-[#FFFFFF] border border-[#CCFBF1] rounded-xl px-4 py-3 text-sm focus:border-[#16A34A] outline-none transition-colors" placeholder="e.g. 09:00 AM - 05:00 PM" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#475569] mb-2">Salary / Payment Info</label>
              <input type="text" name="salary" value={form.salary} onChange={handleChange} className="w-full bg-[#FFFFFF] border border-[#CCFBF1] rounded-xl px-4 py-3 text-sm focus:border-[#16A34A] outline-none transition-colors" placeholder="e.g. $4000/month or 60/40 Split" />
            </div>
          </div>
        </section>

        {/* Profile & Documents */}
        <section className="bg-[#FFFFFF] border border-[#CCFBF1] rounded-2xl p-6 md:p-8">
          <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-[#CCFBF1]">
            <UploadCloud className="text-[#16A34A]" size={24} />
            <h2 className="text-xl font-bold">Profile & Documents</h2>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[#475569] mb-2">Short Professional Bio</label>
              <textarea name="bio" value={form.bio} onChange={handleChange} rows={3} className="w-full bg-[#FFFFFF] border border-[#CCFBF1] rounded-xl px-4 py-3 text-sm focus:border-[#16A34A] outline-none transition-colors resize-none" placeholder="A short bio that users will see on the trainer's public profile..."></textarea>
            </div>
            
            <div className="grid md:grid-cols-3 gap-4">
              <div className="border border-dashed border-[#CCFBF1] bg-[#FFFFFF] rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#16A34A] transition-colors">
                <div className="w-10 h-10 bg-[#E2E8F0] rounded-full flex items-center justify-center mb-3">
                  <User size={18} className="text-[#475569]" />
                </div>
                <p className="text-sm font-medium text-[#1E293B] mb-1">Profile Photo</p>
                <p className="text-xs text-[#555]">JPG, PNG under 2MB</p>
              </div>
              
              <div className="border border-dashed border-[#CCFBF1] bg-[#FFFFFF] rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#16A34A] transition-colors">
                <div className="w-10 h-10 bg-[#E2E8F0] rounded-full flex items-center justify-center mb-3">
                  <FileText size={18} className="text-[#475569]" />
                </div>
                <p className="text-sm font-medium text-[#1E293B] mb-1">Resume / CV</p>
                <p className="text-xs text-[#555]">PDF, DOCX under 5MB</p>
              </div>
              
              <div className="border border-dashed border-[#CCFBF1] bg-[#FFFFFF] rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#16A34A] transition-colors">
                <div className="w-10 h-10 bg-[#E2E8F0] rounded-full flex items-center justify-center mb-3">
                  <CheckCircle2 size={18} className="text-[#475569]" />
                </div>
                <p className="text-sm font-medium text-[#1E293B] mb-1">Certifications</p>
                <p className="text-xs text-[#555]">PDF or Images</p>
              </div>
            </div>
          </div>
        </section>

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row justify-end items-center gap-4 pt-4">
          <Link 
            to="/admin/trainers"
            className="w-full sm:w-auto px-6 py-3 bg-[#FFFFFF] text-[#1E293B] rounded-xl font-semibold hover:bg-[#E2E8F0] transition-colors text-center"
          >
            Cancel
          </Link>
          <button 
            type="button"
            disabled={isLoading}
            onClick={(e) => handleSubmit(e, 'PENDING')}
            className="w-full sm:w-auto px-6 py-3 bg-[#E2E8F0] text-white rounded-xl font-semibold hover:bg-[#333] transition-colors flex items-center justify-center gap-2"
          >
            <Save size={18} />
            <span>Save Trainer</span>
          </button>
          <button 
            type="button"
            disabled={isLoading}
            onClick={(e) => handleSubmit(e, 'APPROVED')}
            className="w-full sm:w-auto px-6 py-3 bg-[#16A34A] text-white rounded-xl font-bold hover:bg-[#15803D] transition-colors flex items-center justify-center gap-2"
          >
            <CheckCircle2 size={18} />
            <span>Hire & Activate</span>
          </button>
        </div>

      </form>
    </div>
  );
};

export default AdminAddTrainer;
