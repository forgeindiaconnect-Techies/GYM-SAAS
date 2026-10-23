import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, UserCircle } from 'lucide-react';
import api from '../../utils/api';

const TrainerOnboarding = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userId, trainingMode: invitedMode } = location.state || {};
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    specialization: '',
    experience: '',
    bio: '',
    expertise: '',
    certifications: '',
    qualifications: '',
    trainingMode: invitedMode || 'offline',
    availability: 'Full Time'
  });

  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <p>Invalid access. Please use the invitation link.</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await api.post('/trainers/profile', {
        userId,
        ...formData
      });
      
      alert('Profile submitted for review!');
      navigate('/pending-approval'); // Or wherever a pending trainer goes
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B12] p-4 md:p-8 font-outfit">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10 mt-8">
          <div className="w-20 h-20 bg-[#6366F1]/10 text-[#6366F1] rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-[#6366F1]/20">
            <UserCircle size={40} />
          </div>
          <h1 className="text-4xl font-bold text-[#11111F] mb-3">Complete Your Profile</h1>
          <p className="text-[#A1A1AA] text-lg max-w-lg mx-auto">
            Tell us about your professional background. Once submitted, the gym owner will review your profile.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl border border-[#292940] overflow-hidden">
          <div className="p-8 space-y-8">
            
            {/* Professional Info */}
            <section>
              <h3 className="text-xl font-bold text-[#11111F] mb-6 flex items-center border-b pb-2">
                <CheckCircle2 className="mr-2 text-[#6366F1]" size={20} /> Professional Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-[#A1A1AA] mb-2">Specialization *</label>
                  <input required placeholder="e.g. Weightlifting, Yoga, HIIT" value={formData.specialization} onChange={e => setFormData({...formData, specialization: e.target.value})} className="w-full border border-[#292940] rounded-xl px-4 py-3 outline-none focus:border-[#6366F1] bg-[#0B0B12]" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#A1A1AA] mb-2">Experience (Years) *</label>
                  <input required type="number" min="0" placeholder="e.g. 5" value={formData.experience} onChange={e => setFormData({...formData, experience: e.target.value})} className="w-full border border-[#292940] rounded-xl px-4 py-3 outline-none focus:border-[#6366F1] bg-[#0B0B12]" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#A1A1AA] mb-2">Training Mode</label>
                  <select value={formData.trainingMode} onChange={e => setFormData({...formData, trainingMode: e.target.value})} className="w-full border border-[#292940] rounded-xl px-4 py-3 outline-none focus:border-[#6366F1] bg-[#0B0B12]">
                    <option value="offline">Offline</option>
                    <option value="online">Online</option>
                    <option value="both">Both</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#A1A1AA] mb-2">Availability</label>
                  <select value={formData.availability} onChange={e => setFormData({...formData, availability: e.target.value})} className="w-full border border-[#292940] rounded-xl px-4 py-3 outline-none focus:border-[#6366F1] bg-[#0B0B12]">
                    <option value="Full Time">Full Time</option>
                    <option value="Part Time">Part Time</option>
                    <option value="Weekends Only">Weekends Only</option>
                    <option value="Evenings Only">Evenings Only</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Qualifications */}
            <section>
              <h3 className="text-xl font-bold text-[#11111F] mb-6 flex items-center border-b pb-2">
                <CheckCircle2 className="mr-2 text-[#6366F1]" size={20} /> Qualifications & Expertise
              </h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-[#A1A1AA] mb-2">Qualifications & Degrees</label>
                  <input placeholder="e.g. B.S. in Kinesiology" value={formData.qualifications} onChange={e => setFormData({...formData, qualifications: e.target.value})} className="w-full border border-[#292940] rounded-xl px-4 py-3 outline-none focus:border-[#6366F1] bg-[#0B0B12]" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#A1A1AA] mb-2">Certifications</label>
                  <input placeholder="e.g. NASM CPT, ACE" value={formData.certifications} onChange={e => setFormData({...formData, certifications: e.target.value})} className="w-full border border-[#292940] rounded-xl px-4 py-3 outline-none focus:border-[#6366F1] bg-[#0B0B12]" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#A1A1AA] mb-2">Areas of Expertise</label>
                  <textarea rows={3} placeholder="Describe your main areas of expertise..." value={formData.expertise} onChange={e => setFormData({...formData, expertise: e.target.value})} className="w-full border border-[#292940] rounded-xl px-4 py-3 outline-none focus:border-[#6366F1] bg-[#0B0B12]" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#A1A1AA] mb-2">Short Bio</label>
                  <textarea rows={4} placeholder="Write a short biography about yourself..." value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} className="w-full border border-[#292940] rounded-xl px-4 py-3 outline-none focus:border-[#6366F1] bg-[#0B0B12]" />
                </div>
              </div>
            </section>

          </div>
          
          <div className="p-8 bg-[#0B0B12] border-t border-[#292940]">
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full py-4 bg-[#11111F] text-white font-bold text-lg rounded-xl hover:bg-black transition-colors disabled:opacity-70 shadow-lg"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Profile For Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TrainerOnboarding;
