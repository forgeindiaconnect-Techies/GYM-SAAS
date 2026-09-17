import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Plus, Trash2, CheckCircle, Eye, EyeOff, X, Mail, UserPlus, Check, PauseCircle, Clock, Ban, ShieldCheck } from 'lucide-react';
import api from '../../utils/api';

const GymAdminTrainers = () => {
  const { user } = useAuth();
  const { selectedBranch } = useOutletContext<{ selectedBranch: string }>();
  const [trainers, setTrainers] = useState<any[]>([]);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const mockTrainers = [
    { _id: 'mock-1', name: 'Arnold S.', email: 'arnold@gym.com', phone: '9876543210', specialization: 'Weight Loss', trainingMode: 'offline', status: 'Active', experience: '5 Years', qualifications: 'ACE Certified', fee: '₹3000/mo', availableDays: 'Mon-Sat', profilePhoto: '' },
    { _id: 'mock-2', name: 'Sarah C.', email: 'sarah@gym.com', phone: '9876543211', specialization: 'Yoga & Flexibility', trainingMode: 'online', status: 'Active', experience: '3 Years', qualifications: 'RYT-200', fee: '₹2500/mo', availableDays: 'Mon-Fri', profilePhoto: '' },
    { _id: 'mock-3', name: 'Mike T.', email: 'mike@gym.com', phone: '9876543212', specialization: 'Strength & Conditioning', trainingMode: 'offline', status: 'Suspended', experience: '7 Years', qualifications: 'CSCS', fee: '₹4000/mo', availableDays: 'Tue-Sun', profilePhoto: '' },
  ];
  
  const [showHireModal, setShowHireModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [hireMethod, setHireMethod] = useState<'manual' | 'invite' | null>(null);
  const [selectedTrainer, setSelectedTrainer] = useState<any>(null);
  const navigate = useNavigate();
  
  const [manualForm, setManualForm] = useState({ name: '', email: '', phone: '', profilePhoto: '', specialization: '', experience: '', trainingMode: 'offline', qualifications: '', certifications: '', expertise: '', bio: '', fee: '', paymentType: 'Per Month', availableDays: 'Monday to Friday', availableStartTime: '06:00 AM', availableEndTime: '08:00 PM', availableSlot: '', password: '', confirmPassword: '' });
  const [inviteForm, setInviteForm] = useState({ trainerName: '', email: '', phone: '', specialization: '', trainingMode: 'offline', personalMessage: '' });

  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);



  const fetchTrainers = async () => {
    try {
      setIsLoading(true);
      const res = await api.get(`/trainers?branchId=${selectedBranch}`);
      const apiTrainers = res.data.trainers || [];
      setTrainers(apiTrainers);
      setInvitations(res.data.invitations || []);
    } catch (err) {
      console.error(err);
      // API unavailable — show mock data so page isn't empty
      setTrainers(mockTrainers);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainers();
  }, [selectedBranch]);

  const validateEmail = (email: string) => {
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
  };

  const validatePhone = (phone: string) => {
    return /^\d{10}$/.test(phone);
  };

  const handleManualAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail(manualForm.email)) {
      alert('Invalid email address format.');
      return;
    }
    if (manualForm.password !== manualForm.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    if (!validatePhone(manualForm.phone)) {
      alert('Phone number must be exactly 10 digits.');
      return;
    }
    if (!otpVerified) {
      alert('Please verify email using OTP (Demo).');
      return;
    }

    try {
      await api.post('/trainers/manual-add', { ...manualForm, branchId: selectedBranch });
      alert('Trainer added successfully!');
      setShowHireModal(false);
      setHireMethod(null);
      setManualForm({ name: '', email: '', phone: '', profilePhoto: '', specialization: '', experience: '', trainingMode: 'offline', qualifications: '', certifications: '', expertise: '', bio: '', fee: '', paymentType: 'Per Month', availableDays: 'Monday to Friday', availableStartTime: '06:00 AM', availableEndTime: '08:00 PM', availableSlot: '', password: '', confirmPassword: '' });
      setOtpSent(false);
      setOtpVerified(false);
      setOtpInput('');
      fetchTrainers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add trainer');
    }
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(inviteForm.email)) {
      alert('Invalid email address format.');
      return;
    }
    if (inviteForm.phone && !validatePhone(inviteForm.phone)) {
      alert('Phone number must be exactly 10 digits.');
      return;
    }

    try {
      await api.post('/trainers/invite', inviteForm);
      alert('Invitation sent successfully!');
      setShowHireModal(false);
      setHireMethod(null);
      setInviteForm({ trainerName: '', email: '', phone: '', specialization: '', trainingMode: 'offline', personalMessage: '' });
      fetchTrainers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to send invitation');
    }
  };

  const handleSetStatus = async (id: string, newStatus: string) => {
    if(!window.confirm(`Are you sure you want to change the status to ${newStatus}?`)) return;
    try {
      const payload: any = { status: newStatus };
      if (newStatus === 'Rejected') {
        payload.reason = 'Rejected by gym owner';
      }
      await api.patch(`/trainers/${id}/status`, payload);
      alert(`Trainer status updated to ${newStatus}`);
      fetchTrainers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };



  const handleDelete = async (id: string) => {
    if(!window.confirm("Are you sure you want to completely remove this trainer?")) return;
    try {
      await api.delete(`/trainers/${id}`);
      alert('Trainer removed');
      fetchTrainers();
    } catch (err: any) {
      alert('Failed to remove trainer');
    }
  };

  const renderTrainerModeOptions = () => {
    return (
      <>
        <option value="offline">Offline</option>
        <option value="online">Online</option>
        <option value="both">Both</option>
      </>
    );
  };

  const renderTimeOptions = () => {
    const options = [];
    for (let i = 0; i < 24; i++) {
      for (let j = 0; j < 60; j += 30) {
        const hour = i === 0 ? 12 : i > 12 ? i - 12 : i;
        const ampm = i < 12 ? 'AM' : 'PM';
        const min = j === 0 ? '00' : '30';
        const timeStr = `${hour < 10 ? '0' + hour : hour}:${min} ${ampm}`;
        options.push(<option key={timeStr} value={timeStr}>{timeStr}</option>);
      }
    }
    return options;
  };

  const getTrainerLimit = (plan?: string) => {
    switch (plan?.toUpperCase()) {
      case 'FREE_TRIAL': return 1;
      case 'SILVER': return 5;
      case 'GOLD': return 15;
      case 'PREMIUM': return Infinity;
      default: return 1;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#1E293B] tracking-tight">Trainers</h1>
          <p className="text-[#475569] mt-1">Manage all trainers hired by your gym.</p>
        </div>
        <button 
          onClick={() => { 
            const limit = getTrainerLimit(user?.subscriptionPlan);
            const currentTotal = trainers.length + invitations.length;
            if (currentTotal >= limit) {
              setShowUpgradeModal(true);
            } else {
              setShowHireModal(true); setHireMethod(null); 
            }
          }} 
          className="flex items-center space-x-2 px-4 py-2 bg-[#16A34A] text-white rounded-xl font-semibold hover:bg-[#15803D] transition-colors"
        >
          <Plus size={20} />
          <span>Hire Trainer</span>
        </button>
      </div>

      <div className="bg-[#FFFFFF] border border-[#CCFBF1] rounded-2xl overflow-hidden">
        <table className="w-full text-left text-sm text-[#475569]">
          <thead className="bg-[#F8FAFC] border-b border-[#CCFBF1] text-[#1E293B]">
            <tr>
              <th className="px-6 py-4 font-bold">Trainer Info</th>
              <th className="px-6 py-4 font-bold">Specialization</th>
              <th className="px-6 py-4 font-bold">Mode</th>
              <th className="px-6 py-4 font-bold">Status</th>
              <th className="px-6 py-4 font-bold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#CCFBF1]">
            {isLoading ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center">Loading trainers...</td></tr>
            ) : trainers.length === 0 && invitations.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center">No trainers found. Hire a trainer to get started.</td></tr>
            ) : (
              <>
                {/* Active/Suspended/Pending Profiles */}
                {trainers.map(trainer => (
                  <tr key={trainer._id} className="hover:bg-[#F0FDFA] transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-[#1E293B]">{trainer.name}</div>
                      <div className="text-xs">{trainer.email}</div>
                    </td>
                    <td className="px-6 py-4 font-medium">{trainer.specialization}</td>
                    <td className="px-6 py-4 capitalize font-medium">{trainer.trainingMode || 'offline'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                        trainer.status === 'Active' ? 'bg-[#16A34A]/10 text-[#16A34A] border-[#16A34A]/20' : 
                        trainer.status === 'Pending' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' : 
                        'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                        {trainer.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex space-x-3 items-center">
                      <button onClick={() => setSelectedTrainer(trainer)} className="text-[#475569] hover:text-[#16A34A] transition-colors" title="View Profile">
                        <Eye size={18} />
                      </button>
                      
                      <div className="flex space-x-2 border-l border-r border-[#CCFBF1] px-3">
                        <button onClick={() => handleSetStatus(trainer._id, 'Active')} className={`transition-colors ${trainer.status === 'Active' ? 'text-[#16A34A]' : 'text-[#475569] hover:text-[#16A34A]'}`} title="Set Active">
                          <CheckCircle size={18} />
                        </button>
                        <button onClick={() => handleSetStatus(trainer._id, 'Suspended')} className={`transition-colors ${trainer.status === 'Suspended' ? 'text-orange-500' : 'text-[#475569] hover:text-orange-500'}`} title="Set Inactive (Suspend)">
                          <PauseCircle size={18} />
                        </button>
                        <button onClick={() => handleSetStatus(trainer._id, 'Pending')} className={`transition-colors ${trainer.status === 'Pending' ? 'text-blue-500' : 'text-[#475569] hover:text-blue-500'}`} title="Set Pending">
                          <Clock size={18} />
                        </button>
                        <button onClick={() => handleSetStatus(trainer._id, 'Rejected')} className={`transition-colors ${trainer.status === 'Rejected' ? 'text-red-500' : 'text-[#475569] hover:text-red-500'}`} title="Set Rejected">
                          <Ban size={18} />
                        </button>
                      </div>
                      
                      <button onClick={() => handleDelete(trainer._id)} className="text-[#475569] hover:text-red-500 transition-colors" title="Remove">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
                
                {/* Pending Invitations */}
                {invitations.map(invite => (
                  <tr key={invite._id} className="bg-gray-50/50 hover:bg-[#F0FDFA] transition-colors opacity-70">
                    <td className="px-6 py-4">
                      <div className="font-bold text-[#1E293B]">{invite.trainerName} <span className="text-xs font-normal ml-2 bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Invited</span></div>
                      <div className="text-xs">{invite.email}</div>
                    </td>
                    <td className="px-6 py-4 font-medium">-</td>
                    <td className="px-6 py-4 capitalize font-medium">{invite.trainingMode || 'offline'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                        invite.status === 'Pending' ? 'bg-blue-500/10 text-blue-600 border-blue-500/20' : 
                        invite.status === 'Accepted' ? 'bg-[#16A34A]/10 text-[#16A34A] border-[#16A34A]/20' : 
                        'bg-gray-500/10 text-gray-500 border-gray-500/20'}`}>
                        Invite {invite.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex space-x-3 items-center">
                      <button disabled className="text-gray-400 cursor-not-allowed" title="Profile not created yet">
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </>
            )}
          </tbody>
        </table>
      </div>

      {/* Hire Trainer Selection Modal */}
      {showHireModal && !hireMethod && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#FFFFFF] rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden border border-[#CCFBF1] mt-10 mb-10">
            <div className="p-6 border-b border-[#CCFBF1] flex justify-between items-center">
              <h2 className="text-2xl font-bold text-[#1E293B]">Hire Trainer</h2>
              <button onClick={() => setShowHireModal(false)} className="text-[#475569] hover:text-[#1E293B]"><X size={24} /></button>
            </div>
            <div className="p-8">
              <h3 className="text-center text-lg text-[#475569] mb-8">How would you like to add the trainer?</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button onClick={() => setHireMethod('manual')} className="flex flex-col items-center p-8 border-2 border-[#CCFBF1] rounded-2xl hover:border-[#16A34A] hover:bg-[#F0FDFA] transition-all group text-left">
                  <div className="w-16 h-16 bg-[#16A34A]/10 text-[#16A34A] rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <UserPlus size={32} />
                  </div>
                  <h4 className="text-xl font-bold text-[#1E293B] mb-2">Manual Add</h4>
                  <p className="text-sm text-[#475569] text-center">Enter the trainer's details and create their profile yourself.</p>
                </button>
                <button onClick={() => setHireMethod('invite')} className="flex flex-col items-center p-8 border-2 border-[#CCFBF1] rounded-2xl hover:border-[#16A34A] hover:bg-[#F0FDFA] transition-all group text-left">
                  <div className="w-16 h-16 bg-[#16A34A]/10 text-[#16A34A] rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Mail size={32} />
                  </div>
                  <h4 className="text-xl font-bold text-[#1E293B] mb-2">Send Invitation</h4>
                  <p className="text-sm text-[#475569] text-center">Send a secure invitation so the trainer can create and complete their own profile.</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manual Add Form Modal */}
      {showHireModal && hireMethod === 'manual' && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#FFFFFF] rounded-2xl max-w-3xl w-full shadow-2xl border border-[#CCFBF1] mt-10 mb-10">
            <div className="p-6 border-b border-[#CCFBF1] flex justify-between items-center sticky top-0 bg-white z-10 rounded-t-2xl">
              <h2 className="text-2xl font-bold text-[#1E293B]">Manual Add Trainer</h2>
              <button onClick={() => { setShowHireModal(false); setHireMethod(null); }} className="text-[#475569] hover:text-[#1E293B]"><X size={24} /></button>
            </div>
            <form onSubmit={handleManualAdd} className="p-6 space-y-6">
              
              <section>
                <h3 className="text-lg font-bold text-[#1E293B] mb-4 border-b pb-2">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-[#475569] mb-1">Full Name *</label>
                    <input required value={manualForm.name} onChange={e => setManualForm({...manualForm, name: e.target.value})} className="w-full border border-[#CCFBF1] rounded-lg px-4 py-2 outline-none focus:border-[#16A34A]" />
                  </div>
                  <div className="flex flex-col">
                    <label className="block text-sm font-bold text-[#475569] mb-1">Email *</label>
                    <div className="flex space-x-2">
                      <input type="email" required value={manualForm.email} onChange={e => { setManualForm({...manualForm, email: e.target.value}); setOtpVerified(false); setOtpSent(false); }} className="w-full border border-[#CCFBF1] rounded-lg px-4 py-2 outline-none focus:border-[#16A34A]" />
                      {!otpVerified && (
                        <button type="button" onClick={() => { if(validateEmail(manualForm.email)) { setOtpSent(true); alert('Demo OTP generated: 123456'); } else { alert('Enter a valid email address first'); } }} className="px-3 py-2 bg-blue-100 text-blue-700 font-bold rounded-lg hover:bg-blue-200 text-sm whitespace-nowrap">
                          {otpSent ? 'Resend OTP' : 'Send OTP'}
                        </button>
                      )}
                      {otpVerified && (
                        <div className="px-3 py-2 bg-green-100 text-green-700 font-bold rounded-lg flex items-center text-sm whitespace-nowrap">
                          <Check size={16} className="mr-1"/> Verified
                        </div>
                      )}
                    </div>
                    {otpSent && !otpVerified && (
                      <div className="mt-2 flex space-x-2">
                        <input type="text" placeholder="Enter OTP (123456)" value={otpInput} onChange={e => setOtpInput(e.target.value)} className="w-full border border-[#CCFBF1] rounded-lg px-4 py-2 outline-none focus:border-[#16A34A]" />
                        <button type="button" onClick={() => { if(otpInput === '123456') { setOtpVerified(true); setOtpSent(false); setOtpInput(''); alert('Email Verified!'); } else { alert('Invalid OTP'); } }} className="px-3 py-2 bg-[#16A34A] text-white font-bold rounded-lg hover:bg-[#15803D] text-sm whitespace-nowrap">
                          Verify
                        </button>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#475569] mb-1">Password *</label>
                    <div className="relative">
                      <input type={showPassword ? "text" : "password"} required value={manualForm.password} onChange={e => setManualForm({...manualForm, password: e.target.value})} className="w-full border border-[#CCFBF1] rounded-lg px-4 py-2 outline-none focus:border-[#16A34A] pr-10" placeholder="Trainer login password" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#475569] hover:text-[#16A34A] focus:outline-none">
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#475569] mb-1">Confirm Password *</label>
                    <div className="relative">
                      <input type={showConfirmPassword ? "text" : "password"} required value={manualForm.confirmPassword} onChange={e => setManualForm({...manualForm, confirmPassword: e.target.value})} className="w-full border border-[#CCFBF1] rounded-lg px-4 py-2 outline-none focus:border-[#16A34A] pr-10" placeholder="Confirm password" />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#475569] hover:text-[#16A34A] focus:outline-none">
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-[#475569] mb-1">Phone Number *</label>
                    <input required type="text" maxLength={10} placeholder="10-digit number" value={manualForm.phone} onChange={e => setManualForm({...manualForm, phone: e.target.value.replace(/\D/g, '')})} className="w-full border border-[#CCFBF1] rounded-lg px-4 py-2 outline-none focus:border-[#16A34A]" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#475569] mb-1">Trainer Mode *</label>
                    <select required value={manualForm.trainingMode} onChange={e => setManualForm({...manualForm, trainingMode: e.target.value})} className="w-full border border-[#CCFBF1] rounded-lg px-4 py-2 outline-none focus:border-[#16A34A]">
                      {renderTrainerModeOptions()}
                    </select>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-bold text-[#1E293B] mb-4 border-b pb-2">Professional Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-[#475569] mb-1">Specialization *</label>
                    <input required value={manualForm.specialization} onChange={e => setManualForm({...manualForm, specialization: e.target.value})} className="w-full border border-[#CCFBF1] rounded-lg px-4 py-2 outline-none focus:border-[#16A34A]" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#475569] mb-1">Experience (Years)</label>
                    <input type="number" value={manualForm.experience} onChange={e => setManualForm({...manualForm, experience: e.target.value})} className="w-full border border-[#CCFBF1] rounded-lg px-4 py-2 outline-none focus:border-[#16A34A]" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#475569] mb-1">Qualifications *</label>
                    <input required value={manualForm.qualifications} onChange={e => setManualForm({...manualForm, qualifications: e.target.value})} className="w-full border border-[#CCFBF1] rounded-lg px-4 py-2 outline-none focus:border-[#16A34A]" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#475569] mb-1">Certifications</label>
                    <input value={manualForm.certifications} onChange={e => setManualForm({...manualForm, certifications: e.target.value})} className="w-full border border-[#CCFBF1] rounded-lg px-4 py-2 outline-none focus:border-[#16A34A]" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-[#475569] mb-1">Areas of Expertise *</label>
                    <textarea required rows={2} value={manualForm.expertise} onChange={e => setManualForm({...manualForm, expertise: e.target.value})} className="w-full border border-[#CCFBF1] rounded-lg px-4 py-2 outline-none focus:border-[#16A34A]" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-[#475569] mb-1">Short Bio</label>
                    <textarea rows={3} value={manualForm.bio} onChange={e => setManualForm({...manualForm, bio: e.target.value})} className="w-full border border-[#CCFBF1] rounded-lg px-4 py-2 outline-none focus:border-[#16A34A]" />
                  </div>
                </div>
              </section>
              <section>
                <h3 className="text-lg font-bold text-[#1E293B] mb-4 border-b pb-2">Availability Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-[#475569] mb-1">Available Days</label>
                    <select value={manualForm.availableDays} onChange={e => setManualForm({...manualForm, availableDays: e.target.value})} className="w-full border border-[#CCFBF1] rounded-lg px-4 py-2 outline-none focus:border-[#16A34A]">
                      <option value="Monday to Friday">Monday to Friday</option>
                      <option value="Monday to Saturday">Monday to Saturday</option>
                      <option value="Weekends (Sat & Sun)">Weekends (Sat & Sun)</option>
                      <option value="Everyday">Everyday</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#475569] mb-1">Available Slots per Day</label>
                    <input type="number" min="1" placeholder="e.g. 5" value={manualForm.availableSlot} onChange={e => setManualForm({...manualForm, availableSlot: e.target.value})} className="w-full border border-[#CCFBF1] rounded-lg px-4 py-2 outline-none focus:border-[#16A34A]" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#475569] mb-1">Start Time</label>
                    <select value={manualForm.availableStartTime} onChange={e => setManualForm({...manualForm, availableStartTime: e.target.value})} className="w-full border border-[#CCFBF1] rounded-lg px-4 py-2 outline-none focus:border-[#16A34A]">
                      {renderTimeOptions()}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#475569] mb-1">End Time</label>
                    <select value={manualForm.availableEndTime} onChange={e => setManualForm({...manualForm, availableEndTime: e.target.value})} className="w-full border border-[#CCFBF1] rounded-lg px-4 py-2 outline-none focus:border-[#16A34A]">
                      {renderTimeOptions()}
                    </select>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-bold text-[#1E293B] mb-4 border-b pb-2">Employment / Payment</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-[#475569] mb-1">Trainer Fee</label>
                    <input type="number" value={manualForm.fee} onChange={e => setManualForm({...manualForm, fee: e.target.value})} className="w-full border border-[#CCFBF1] rounded-lg px-4 py-2 outline-none focus:border-[#16A34A]" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#475569] mb-1">Payment Type</label>
                    <select value={manualForm.paymentType} onChange={e => setManualForm({...manualForm, paymentType: e.target.value})} className="w-full border border-[#CCFBF1] rounded-lg px-4 py-2 outline-none focus:border-[#16A34A]">
                      <option value="Per Week">Per Week</option>
                      <option value="Per Month">Per Month</option>
                      <option value="Per Session">Per Session</option>
                    </select>
                  </div>
                </div>
              </section>

              <div className="flex justify-end space-x-3 pt-4 border-t border-[#CCFBF1]">
                <button type="button" onClick={() => { setShowHireModal(false); setHireMethod(null); }} className="px-6 py-2 text-[#475569] font-bold hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
                <button type="submit" className="px-8 py-2 bg-[#16A34A] text-white rounded-xl font-bold hover:bg-[#15803D] transition-colors shadow-lg shadow-[#16A34A]/20">Add Trainer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Send Invitation Form Modal */}
      {showHireModal && hireMethod === 'invite' && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#FFFFFF] rounded-2xl max-w-2xl w-full shadow-2xl border border-[#CCFBF1] mt-10 mb-10">
            <div className="p-6 border-b border-[#CCFBF1] flex justify-between items-center sticky top-0 bg-white z-10 rounded-t-2xl">
              <h2 className="text-2xl font-bold text-[#1E293B]">Invite New Trainer</h2>
              <button onClick={() => { setShowHireModal(false); setHireMethod(null); }} className="text-[#475569] hover:text-[#1E293B]"><X size={24} /></button>
            </div>
            <form onSubmit={handleSendInvite} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-[#475569] mb-1">Trainer Name *</label>
                  <input required value={inviteForm.trainerName} onChange={e => setInviteForm({...inviteForm, trainerName: e.target.value})} className="w-full border border-[#CCFBF1] rounded-lg px-4 py-2 outline-none focus:border-[#16A34A]" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#475569] mb-1">Email Address *</label>
                  <input type="email" required value={inviteForm.email} onChange={e => setInviteForm({...inviteForm, email: e.target.value})} className="w-full border border-[#CCFBF1] rounded-lg px-4 py-2 outline-none focus:border-[#16A34A]" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#475569] mb-1">Phone Number</label>
                  <input type="text" maxLength={10} placeholder="10-digit number" value={inviteForm.phone} onChange={e => setInviteForm({...inviteForm, phone: e.target.value.replace(/\D/g, '')})} className="w-full border border-[#CCFBF1] rounded-lg px-4 py-2 outline-none focus:border-[#16A34A]" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#475569] mb-1">Specialization</label>
                  <input value={inviteForm.specialization} onChange={e => setInviteForm({...inviteForm, specialization: e.target.value})} className="w-full border border-[#CCFBF1] rounded-lg px-4 py-2 outline-none focus:border-[#16A34A]" />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-[#475569] mb-1">Personal Message</label>
                  <textarea rows={3} placeholder="Add a personal note to the email invitation..." value={inviteForm.personalMessage} onChange={e => setInviteForm({...inviteForm, personalMessage: e.target.value})} className="w-full border border-[#CCFBF1] rounded-lg px-4 py-2 outline-none focus:border-[#16A34A]" />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-[#CCFBF1]">
                <button type="button" onClick={() => { setShowHireModal(false); setHireMethod(null); }} className="px-6 py-2 text-[#475569] font-bold hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
                <button type="submit" className="px-8 py-2 bg-[#16A34A] text-white rounded-xl font-bold hover:bg-[#15803D] transition-colors shadow-lg shadow-[#16A34A]/20 flex items-center gap-2">
                  <Mail size={18} /> Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Trainer View Modal */}
      {selectedTrainer && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#FFFFFF] rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden border border-[#CCFBF1] mt-10 mb-10">
            {/* Header */}
            <div className="p-6 border-b border-[#CCFBF1] flex justify-between items-center bg-gradient-to-r from-[#F0FDFA] to-[#FFFFFF]">
              <h2 className="text-xl font-bold text-[#1E293B]">Trainer Profile</h2>
              <button onClick={() => setSelectedTrainer(null)} className="text-[#475569] hover:text-[#1E293B] transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto max-h-[75vh]">
              {/* Avatar + Name + Status */}
              <div className="flex items-center space-x-4 pb-4 border-b border-[#F1F5F9]">
                {selectedTrainer.profilePhoto ? (
                  <img src={selectedTrainer.profilePhoto} alt={selectedTrainer.name} className="w-20 h-20 rounded-full object-cover border-2 border-[#CCFBF1] shrink-0" />
                ) : (
                  <div className="w-20 h-20 bg-[#16A34A]/10 text-[#16A34A] rounded-full flex items-center justify-center text-3xl font-bold shrink-0 border-2 border-[#CCFBF1]">
                    {selectedTrainer.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h3 className="text-2xl font-bold text-[#1E293B]">{selectedTrainer.name}</h3>
                  <p className="text-[#475569] text-sm mt-0.5">{selectedTrainer.specialization}</p>
                  <span className={`mt-2 inline-block px-3 py-1 rounded-full text-xs font-bold border ${selectedTrainer.status === 'Active' ? 'bg-[#16A34A]/10 text-[#16A34A] border-[#16A34A]/20' : selectedTrainer.status === 'Pending' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                    {selectedTrainer.status}
                  </span>
                </div>
              </div>

              {/* Section: Contact Info */}
              <div>
                <h4 className="text-xs font-bold text-[#475569] uppercase tracking-wider mb-3">Contact Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4">
                    <p className="text-[#64748B] text-xs font-medium mb-1.5">Email</p>
                    <p className="font-semibold text-[#1E293B] break-all">{selectedTrainer.email || 'N/A'}</p>
                  </div>
                  <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4">
                    <p className="text-[#64748B] text-xs font-medium mb-1.5">Phone</p>
                    <p className="font-semibold text-[#1E293B]">{selectedTrainer.phone || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Section: Professional Info */}
              <div>
                <h4 className="text-xs font-bold text-[#475569] uppercase tracking-wider mb-3">Professional Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4">
                    <p className="text-[#64748B] text-xs font-medium mb-1.5">Specialization</p>
                    <p className="font-semibold text-[#1E293B]">{selectedTrainer.specialization || 'N/A'}</p>
                  </div>
                  <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4">
                    <p className="text-[#64748B] text-xs font-medium mb-1.5">Experience</p>
                    <p className="font-semibold text-[#1E293B]">{selectedTrainer.experience ? `${selectedTrainer.experience} Years` : 'N/A'}</p>
                  </div>
                  <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4">
                    <p className="text-[#64748B] text-xs font-medium mb-1.5">Training Mode</p>
                    <p className="font-semibold text-[#1E293B] capitalize">{selectedTrainer.trainingMode || 'N/A'}</p>
                  </div>
                  <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4">
                    <p className="text-[#64748B] text-xs font-medium mb-1.5">Qualifications</p>
                    <p className="font-semibold text-[#1E293B]">{selectedTrainer.qualifications || 'N/A'}</p>
                  </div>
                  {selectedTrainer.certifications && (
                    <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4">
                      <p className="text-[#64748B] text-xs font-medium mb-1.5">Certifications</p>
                      <p className="font-semibold text-[#1E293B]">{selectedTrainer.certifications}</p>
                    </div>
                  )}
                  {selectedTrainer.expertise && (
                    <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4">
                      <p className="text-[#64748B] text-xs font-medium mb-1.5">Expertise</p>
                      <p className="font-semibold text-[#1E293B]">{selectedTrainer.expertise}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Section: Fee Info */}
              <div>
                <h4 className="text-xs font-bold text-[#475569] uppercase tracking-wider mb-3">Fee & Payment</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4">
                    <p className="text-[#64748B] text-xs font-medium mb-1.5">Fee</p>
                    <p className="font-semibold text-[#1E293B]">{selectedTrainer.fee ? `₹${selectedTrainer.fee}` : 'N/A'}</p>
                  </div>
                  <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4">
                    <p className="text-[#64748B] text-xs font-medium mb-1.5">Payment Type</p>
                    <p className="font-semibold text-[#1E293B]">{selectedTrainer.paymentType || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Section: Availability */}
              <div>
                <h4 className="text-xs font-bold text-[#475569] uppercase tracking-wider mb-3">Availability</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4">
                    <p className="text-[#64748B] text-xs font-medium mb-1.5">Available Days</p>
                    <p className="font-semibold text-[#1E293B]">{selectedTrainer.availableDays || selectedTrainer.availability?.days || 'N/A'}</p>
                  </div>
                  <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4">
                    <p className="text-[#64748B] text-xs font-medium mb-1.5">Timings</p>
                    <p className="font-semibold text-[#1E293B]">
                      {selectedTrainer.availableStartTime || selectedTrainer.availability?.startTime || '—'}
                      {(selectedTrainer.availableStartTime || selectedTrainer.availability?.startTime) ? ' → ' : ''}
                      {selectedTrainer.availableEndTime || selectedTrainer.availability?.endTime || 'N/A'}
                    </p>
                  </div>
                  {(selectedTrainer.availableSlot || selectedTrainer.availability?.slot) && (
                    <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4 sm:col-span-2">
                      <p className="text-[#64748B] text-xs font-medium mb-1.5">Slot Duration</p>
                      <p className="font-semibold text-[#1E293B]">{selectedTrainer.availableSlot || selectedTrainer.availability?.slot}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Section: Bio */}
              {selectedTrainer.bio && (
                <div>
                  <h4 className="text-xs font-bold text-[#475569] uppercase tracking-wider mb-3">About</h4>
                  <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4">
                    <p className="text-[#1E293B] text-sm leading-relaxed">{selectedTrainer.bio}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-[#F8FAFC] border-t border-[#CCFBF1] flex justify-end">
              <button onClick={() => setSelectedTrainer(null)} className="px-6 py-2 bg-[#FFFFFF] border border-[#CCFBF1] text-[#1E293B] rounded-xl font-bold hover:bg-[#F1F5F9] transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Upgrade Prompt Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#FFFFFF] border border-[#CCFBF1] rounded-2xl max-w-md w-full p-8 text-center shadow-2xl relative">
            <button 
              onClick={() => setShowUpgradeModal(false)}
              className="absolute top-4 right-4 text-[#475569] hover:text-[#16A34A] transition-colors"
            >
              <X size={20} />
            </button>
            
            <div className="w-16 h-16 bg-[#0D9488]/10 border border-[#0D9488]/20 text-[#0D9488] rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldCheck size={32} />
            </div>
            
            <h2 className="text-2xl font-bold text-[#1E293B] mb-3">Trainer Limit Reached</h2>
            <p className="text-[#475569] mb-8 leading-relaxed">
              Your current <span className="text-[#16A34A] font-semibold">{user?.subscriptionPlan || 'Free Trial'}</span> plan allows up to {getTrainerLimit(user?.subscriptionPlan)} trainers. If you want to add more trainers and branches, you need to upgrade your subscription plan.
            </p>
            
            <div className="space-y-3">
              <button 
                onClick={() => navigate('/admin/subscription')} 
                className="w-full py-3.5 bg-[#16A34A] text-white font-bold rounded-xl hover:bg-[#15803D] transition-colors shadow-lg shadow-[#16A34A]/20"
              >
                View Upgrade Plans
              </button>
              <button 
                onClick={() => setShowUpgradeModal(false)} 
                className="w-full py-3.5 bg-[#FFFFFF] text-[#1E293B] font-medium rounded-xl border border-[#CCFBF1] hover:bg-[#E2E8F0] transition-colors"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GymAdminTrainers;
