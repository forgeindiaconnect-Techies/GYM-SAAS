import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Dumbbell, User, X } from 'lucide-react';
import api from '../../utils/api';

const TrainerInvitationPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [invitation, setInvitation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [acceptMode, setAcceptMode] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', password: '', confirmPassword: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchInvitation = async () => {
      try {
        const res = await api.get(`/trainers/invitation/${token}`);
        setInvitation(res.data.invitation);
        setFormData(prev => ({ ...prev, name: res.data.invitation.trainerName }));
      } catch (err: any) {
        setError(err.response?.data?.message || 'Invalid or expired invitation link.');
      } finally {
        setLoading(false);
      }
    };
    fetchInvitation();
  }, [token]);

  const handleAccept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    
    try {
      setIsSubmitting(true);
      const res = await api.post(`/trainers/invitation/${token}/accept`, {
        name: formData.name,
        phone: formData.phone,
        password: formData.password
      });
      
      alert('Account created! Let us complete your profile.');
      
      // Navigate to onboarding with userId passed in state (in a real app, you'd auto-login here and use auth context)
      navigate('/invite/trainer/onboarding', { state: { userId: res.data.userId, trainingMode: invitation.trainingMode } });
      
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to accept invitation');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-[#0E1415] flex items-center justify-center font-outfit">Loading invitation details...</div>;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0E1415] flex items-center justify-center p-4 font-outfit">
        <div className="bg-[#141D1E] p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-red-100">
          <div className="w-16 h-16 bg-red-100 text-[#1B2728] rounded-full flex items-center justify-center mx-auto mb-4">
            <X size={32} />
          </div>
          <h2 className="text-2xl font-bold text-[#F5FAFA] mb-2">Invitation Invalid</h2>
          <p className="text-[#9AAEAE]">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0E1415] flex items-center justify-center p-4 font-outfit relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#2A3A3A] rounded-full blur-[100px] opacity-60"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#2DD4BF] rounded-full blur-[120px] opacity-20"></div>

      <div className="bg-[#141D1E] rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-[#2A3A3A] z-10">
        
        {!acceptMode ? (
          <>
            <div className="bg-[#141D1E] p-8 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#141D1E]/10 rounded-full translate-x-16 -translate-y-16"></div>
              <Dumbbell className="text-[#2DD4BF] mx-auto mb-4" size={48} />
              <h1 className="text-2xl font-bold text-white mb-2">You've Been Invited!</h1>
              <p className="text-[#9AAEAE]">To join {invitation.gymId?.name || 'a Gym'} as a Trainer</p>
            </div>
            
            <div className="p-8">
              <div className="bg-[#0E1415] p-4 rounded-xl border border-[#2A3A3A] mb-6">
                {invitation.personalMessage && (
                  <div className="mb-4 text-sm italic text-[#9AAEAE]">
                    "{invitation.personalMessage}"
                  </div>
                )}
                <div className="grid grid-cols-2 gap-y-3 text-sm">
                  <div className="text-[#9AAEAE]">Role</div>
                  <div className="font-semibold text-[#F5FAFA]">Trainer</div>
                  
                  <div className="text-[#9AAEAE]">Mode</div>
                  <div className="font-semibold text-[#F5FAFA] capitalize">{invitation.trainingMode}</div>
                  
                  <div className="text-[#9AAEAE]">Location</div>
                  <div className="font-semibold text-[#F5FAFA]">{invitation.gymId?.location || 'N/A'}</div>
                </div>
              </div>
              
              <div className="space-y-3">
                <button 
                  onClick={() => setAcceptMode(true)}
                  className="w-full py-3.5 bg-[#2DD4BF] text-[#06201D] font-bold font-bold rounded-xl hover:bg-[#5EEAD4] transition-colors shadow-lg shadow-[#2DD4BF]/20"
                >
                  Accept Invitation
                </button>
                <button 
                  onClick={() => setError('You have declined the invitation. You can close this page.')}
                  className="w-full py-3.5 bg-[#141D1E] text-[#9AAEAE] font-bold rounded-xl border border-[#1B2728] hover:bg-[#0E1415] transition-colors"
                >
                  Decline
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="p-8 border-b border-[#1B2728] bg-gradient-to-r from-[#0E1415] to-white">
              <h2 className="text-2xl font-bold text-[#F5FAFA] flex items-center">
                <User className="mr-2 text-[#2DD4BF]" /> Create Account
              </h2>
              <p className="text-[#9AAEAE] mt-1 text-sm">Set up your trainer account details.</p>
            </div>
            
            <form onSubmit={handleAccept} className="p-8 space-y-4">
              <div>
                <label className="block text-sm font-bold text-[#9AAEAE] mb-1">Full Name</label>
                <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border border-[#2A3A3A] rounded-lg px-4 py-2 outline-none focus:border-[#2DD4BF]" />
              </div>
              <div>
                <label className="block text-sm font-bold text-[#9AAEAE] mb-1">Phone Number</label>
                <input required type="tel" maxLength={10} value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10)})} placeholder="10-digit number" className="w-full border border-[#2A3A3A] rounded-lg px-4 py-2 outline-none focus:border-[#2DD4BF]" />
              </div>
              <div>
                <label className="block text-sm font-bold text-[#9AAEAE] mb-1">Password</label>
                <input type="password" required minLength={6} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full border border-[#2A3A3A] rounded-lg px-4 py-2 outline-none focus:border-[#2DD4BF]" />
              </div>
              <div>
                <label className="block text-sm font-bold text-[#9AAEAE] mb-1">Confirm Password</label>
                <input type="password" required minLength={6} value={formData.confirmPassword} onChange={e => setFormData({...formData, confirmPassword: e.target.value})} className="w-full border border-[#2A3A3A] rounded-lg px-4 py-2 outline-none focus:border-[#2DD4BF]" />
              </div>
              
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full py-3.5 mt-4 bg-[#141D1E] text-white font-bold rounded-xl hover:bg-black transition-colors disabled:opacity-70 flex items-center justify-center"
              >
                {isSubmitting ? 'Creating Account...' : 'Continue to Profile Setup'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default TrainerInvitationPage;
