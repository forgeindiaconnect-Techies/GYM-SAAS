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
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 font-outfit">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10 mt-8">
          <div className="w-20 h-20 bg-[#16A34A]/10 text-[#16A34A] rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-[#16A34A]/20">
            <UserCircle size={40} />
          </div>
          <h1 className="text-4xl font-bold text-[#1E293B] mb-3">Complete Your Profile</h1>
          <p className="text-[#475569] text-lg max-w-lg mx-auto">
            Tell us about your professional background. Once submitted, the gym owner will review your profile.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl border border-[#CCFBF1] overflow-hidden">
          <div className="p-8 space-y-8">
            
            {/* Professional Info */}
            <section>
              <h3 className="text-xl font-bold text-[#1E293B] mb-6 flex items-center border-b pb-2">
                <CheckCircle2 className="mr-2 text-[#16A34A]" size={20} /> Professional Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-[#475569] mb-2">Specialization *</label>
                  <input required placeholder="e.g. Weightlifting, Yoga, HIIT" value={formData.specialization} onChange={e => setFormData({...formData, specialization: e.target.value})} className="w-full border border-[#CCFBF1] rounded-xl px-4 py-3 outline-none focus:border-[#16A34A] bg-[#F8FAFC]" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#475569] mb-2">Experience (Years) *</label>
                  <input required type="number" min="0" placeholder="e.g. 5" value={formData.experience} onChange={e => setFormData({...formData, experience: e.target.value})} className="w-full border border-[#CCFBF1] rounded-xl px-4 py-3 outline-none focus:border-[#16A34A] bg-[#F8FAFC]" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#475569] mb-2">Training Mode</label>
                  <select value={formData.trainingMode} onChange={e => setFormData({...formData, trainingMode: e.target.value})} className="w-full border border-[#CCFBF1] rounded-xl px-4 py-3 outline-none focus:border-[#16A34A] bg-[#F8FAFC]">
                    <option value="offline">Offline</option>
                    <option value="online">Online</option>
                    <option value="both">Both</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#475569] mb-2">Availability</label>
                  <select value={formData.availability} onChange={e => setFormData({...formData, availability: e.target.value})} className="w-full border border-[#CCFBF1] rounded-xl px-4 py-3 outline-none focus:border-[#16A34A] bg-[#F8FAFC]">
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
              <h3 className="text-xl font-bold text-[#1E293B] mb-6 flex items-center border-b pb-2">
                <CheckCircle2 className="mr-2 text-[#16A34A]" size={20} /> Qualifications & Expertise
              </h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-[#475569] mb-2">Qualifications & Degrees</label>
                  <input placeholder="e.g. B.S. in Kinesiology" value={formData.qualifications} onChange={e => setFormData({...formData, qualifications: e.target.value})} className="w-full border border-[#CCFBF1] rounded-xl px-4 py-3 outline-none focus:border-[#16A34A] bg-[#F8FAFC]" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#475569] mb-2">Certifications</label>
                  <input placeholder="e.g. NASM CPT, ACE" value={formData.certifications} onChange={e => setFormData({...formData, certifications: e.target.value})} className="w-full border border-[#CCFBF1] rounded-xl px-4 py-3 outline-none focus:border-[#16A34A] bg-[#F8FAFC]" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#475569] mb-2">Areas of Expertise</label>
                  <textarea rows={3} placeholder="Describe your main areas of expertise..." value={formData.expertise} onChange={e => setFormData({...formData, expertise: e.target.value})} className="w-full border border-[#CCFBF1] rounded-xl px-4 py-3 outline-none focus:border-[#16A34A] bg-[#F8FAFC]" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#475569] mb-2">Short Bio</label>
                  <textarea rows={4} placeholder="Write a short biography about yourself..." value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} className="w-full border border-[#CCFBF1] rounded-xl px-4 py-3 outline-none focus:border-[#16A34A] bg-[#F8FAFC]" />
                </div>
              </div>
            </section>

          </div>
          
          <div className="p-8 bg-[#F8FAFC] border-t border-[#CCFBF1]">
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full py-4 bg-[#1E293B] text-white font-bold text-lg rounded-xl hover:bg-black transition-colors disabled:opacity-70 shadow-lg"
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
