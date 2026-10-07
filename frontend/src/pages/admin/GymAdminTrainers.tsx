import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useOutletContext } from 'react-router-dom';
import {
  Plus, Trash2, CheckCircle, Eye, EyeOff, X, Mail, UserPlus, Check, PauseCircle,
  Clock, Ban, ShieldCheck, Edit, Phone, Calendar, Dumbbell, Award, Briefcase,
  GraduationCap, Sparkles, IndianRupee, Activity, Lock
} from 'lucide-react';
import api from '../../utils/api';

const GymAdminTrainers = () => {
  const { user } = useAuth();
  const { selectedBranch } = useOutletContext<{ selectedBranch: string }>();
  const [trainers, setTrainers] = useState<any[]>([]);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showHireModal, setShowHireModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [hireMethod, setHireMethod] = useState<'manual' | 'invite' | null>(null);
  const [selectedTrainer, setSelectedTrainer] = useState<any>(null);
  const [editTrainer, setEditTrainer] = useState<any>(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', phone: '', profilePhoto: '', specialization: '', experience: '', trainingMode: 'offline', qualifications: '', certifications: '', expertise: '', bio: '', fee: '', paymentType: 'Per Month', availableDays: 'Monday to Friday', availableStartTime: '06:00 AM', availableEndTime: '08:00 PM', availableSlot: '' });
  const navigate = useNavigate();
  
  const [manualForm, setManualForm] = useState({ name: '', email: '', phone: '', profilePhoto: '', specialization: '', experience: '', trainingMode: 'offline', qualifications: '', certifications: '', expertise: '', bio: '', fee: '', paymentType: 'Per Month', availableDays: 'Monday to Friday', availableStartTime: '06:00 AM', availableEndTime: '08:00 PM', availableSlot: '', password: '', confirmPassword: '' });
  const [inviteForm, setInviteForm] = useState({ trainerName: '', email: '', phone: '', specialization: '', trainingMode: 'offline', personalMessage: '' });

  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const getExpertiseList = (val: any): string[] => {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    if (typeof val === 'string') {
      if (val.includes(',')) {
        return val.split(',').map(s => s.trim()).filter(Boolean);
      }
      if (val.includes(';')) {
        return val.split(';').map(s => s.trim()).filter(Boolean);
      }
      if (val.includes('\n')) {
        return val.split('\n').map(s => s.trim()).filter(Boolean);
      }
      return [val.trim()];
    }
    return [String(val)];
  };

  const fetchTrainers = async () => {
    try {
      setIsLoading(true);
      const branchQuery = selectedBranch && selectedBranch !== 'undefined' && selectedBranch !== 'null'
        ? `?branchId=${selectedBranch}`
        : '';
      const res = await api.get(`/trainers${branchQuery}`);
      const apiTrainers = res.data.trainers || [];
      setTrainers(apiTrainers);
      setInvitations(res.data.invitations || []);
    } catch (err) {
      console.error('Failed to fetch trainers:', err);
      setTrainers([]);
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

  const openEditModal = (trainer: any) => {
    setEditTrainer(trainer);
    setEditForm({
      name: trainer.name || '',
      email: trainer.email || '',
      phone: trainer.phone || '',
      profilePhoto: trainer.profilePhoto || '',
      specialization: trainer.specialization || '',
      experience: trainer.experience || '',
      trainingMode: trainer.trainingMode || 'offline',
      qualifications: trainer.qualifications || '',
      certifications: trainer.certifications || '',
      expertise: trainer.expertise || '',
      bio: trainer.bio || '',
      fee: trainer.fee || '',
      paymentType: trainer.paymentType || 'Per Month',
      availableDays: trainer.availableDays || trainer.availability?.days || 'Monday to Friday',
      availableStartTime: trainer.availableStartTime || trainer.availability?.startTime || '06:00 AM',
      availableEndTime: trainer.availableEndTime || trainer.availability?.endTime || '08:00 PM',
      availableSlot: trainer.availableSlot || trainer.availability?.slot || ''
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(editForm.email)) {
      alert('Invalid email address format.');
      return;
    }
    if (!validatePhone(editForm.phone)) {
      alert('Phone number must be exactly 10 digits.');
      return;
    }

    try {
      await api.put(`/trainers/${editTrainer._id}`, editForm);
      alert('Trainer updated successfully!');
      setEditTrainer(null);
      fetchTrainers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update trainer');
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
          <h1 className="text-3xl font-bold text-[#292524] tracking-tight">Trainers</h1>
          <p className="text-[#78716C] mt-1">Manage all trainers hired by your gym.</p>
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
          className="flex items-center space-x-2 px-4 py-2 bg-[#F97316] text-white rounded-xl font-semibold hover:bg-[#EA580C] transition-colors"
        >
          <Plus size={20} />
          <span>Hire Trainer</span>
        </button>
      </div>

      <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl overflow-hidden">
        <table className="w-full text-left text-sm text-[#78716C]">
          <thead className="bg-[#FFFDF8] border-b border-[#E7E5E4] text-[#292524]">
            <tr>
              <th className="px-6 py-4 font-bold">Trainer Info</th>
              <th className="px-6 py-4 font-bold">Specialization</th>
              <th className="px-6 py-4 font-bold">Mode</th>
              <th className="px-6 py-4 font-bold">Fee</th>
              <th className="px-6 py-4 font-bold">Status</th>
              <th className="px-6 py-4 font-bold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E7E5E4]">
            {isLoading ? (
              <tr><td colSpan={6} className="px-6 py-8 text-center">Loading trainers...</td></tr>
            ) : trainers.length === 0 && invitations.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-8 text-center">No trainers found. Hire a trainer to get started.</td></tr>
            ) : (
              <>
                {/* Active/Suspended/Pending Profiles */}
                {trainers.map(trainer => (
                  <tr key={trainer._id} className="hover:bg-[#FFFDF8] transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-[#292524]">{trainer.name}</div>
                      <div className="text-xs text-gray-500">{trainer.email}</div>
                      {trainer.phone && <div className="text-xs text-gray-400">{trainer.phone}</div>}
                    </td>
                    <td className="px-6 py-4 font-medium">{trainer.specialization || 'General'}</td>
                    <td className="px-6 py-4 capitalize font-medium">
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                        trainer.trainingMode === 'online' ? 'bg-blue-100 text-blue-700' :
                        trainer.trainingMode === 'both' ? 'bg-purple-100 text-purple-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {trainer.trainingMode || 'offline'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-[#292524]">
                      {trainer.fee ? (
                        <div>
                          <span>₹{Number(trainer.fee).toLocaleString('en-IN')}</span>
                          <span className="text-xs text-gray-500 font-normal"> / {trainer.paymentType === 'Per Week' ? 'wk' : trainer.paymentType === 'Per Session' ? 'ses' : 'mo'}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic text-xs">Not configured</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                        trainer.status === 'Active' ? 'bg-[#F97316]/10 text-[#F97316] border-[#F97316]/20' : 
                        trainer.status === 'Pending' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' : 
                        'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                        {trainer.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex space-x-3 items-center">
                      <button onClick={() => setSelectedTrainer(trainer)} className="text-[#78716C] hover:text-[#F97316] transition-colors" title="View Profile">
                        <Eye size={18} />
                      </button>
                      <button onClick={() => openEditModal(trainer)} className="text-[#78716C] hover:text-blue-500 transition-colors" title="Edit Trainer">
                        <Edit size={18} />
                      </button>
                      
                      <div className="flex space-x-2 border-l border-r border-[#E7E5E4] px-3">
                        <button onClick={() => handleSetStatus(trainer._id, 'Active')} className={`transition-colors ${trainer.status === 'Active' ? 'text-[#F97316]' : 'text-[#78716C] hover:text-[#F97316]'}`} title="Set Active">
                          <CheckCircle size={18} />
                        </button>
                        <button onClick={() => handleSetStatus(trainer._id, 'Suspended')} className={`transition-colors ${trainer.status === 'Suspended' ? 'text-orange-500' : 'text-[#78716C] hover:text-orange-500'}`} title="Set Inactive (Suspend)">
                          <PauseCircle size={18} />
                        </button>
                        <button onClick={() => handleSetStatus(trainer._id, 'Pending')} className={`transition-colors ${trainer.status === 'Pending' ? 'text-blue-500' : 'text-[#78716C] hover:text-blue-500'}`} title="Set Pending">
                          <Clock size={18} />
                        </button>
                        <button onClick={() => handleSetStatus(trainer._id, 'Rejected')} className={`transition-colors ${trainer.status === 'Rejected' ? 'text-[#FED7AA]' : 'text-[#78716C] hover:text-[#FED7AA]'}`} title="Set Rejected">
                          <Ban size={18} />
                        </button>
                      </div>
                      
                      <button onClick={() => handleDelete(trainer._id)} className="text-[#78716C] hover:text-red-500 transition-colors" title="Remove">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
                
                {/* Pending Invitations */}
                {invitations.map(invite => (
                  <tr key={invite._id} className="bg-gray-50/50 hover:bg-[#FFFDF8] transition-colors opacity-70">
                    <td className="px-6 py-4">
                      <div className="font-bold text-[#292524]">{invite.trainerName} <span className="text-xs font-normal ml-2 bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Invited</span></div>
                      <div className="text-xs">{invite.email}</div>
                    </td>
                    <td className="px-6 py-4 font-medium">-</td>
                    <td className="px-6 py-4 capitalize font-medium">{invite.trainingMode || 'offline'}</td>
                    <td className="px-6 py-4 text-xs text-gray-400">—</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                        invite.status === 'Pending' ? 'bg-blue-500/10 text-[#FED7AA] border-[#FED7AA]/20' : 
                        invite.status === 'Accepted' ? 'bg-[#F97316]/10 text-[#F97316] border-[#F97316]/20' : 
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
          <div className="bg-[#FFFFFF] rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden border border-[#E7E5E4] mt-10 mb-10">
            <div className="p-6 border-b border-[#E7E5E4] flex justify-between items-center">
              <h2 className="text-2xl font-bold text-[#292524]">Hire Trainer</h2>
              <button onClick={() => setShowHireModal(false)} className="text-[#78716C] hover:text-[#292524]"><X size={24} /></button>
            </div>
            <div className="p-8">
              <h3 className="text-center text-lg text-[#78716C] mb-8">How would you like to add the trainer?</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button onClick={() => setHireMethod('manual')} className="flex flex-col items-center p-8 border-2 border-[#E7E5E4] rounded-2xl hover:border-[#F97316] hover:bg-[#FFFDF8] transition-all group text-left">
                  <div className="w-16 h-16 bg-[#F97316]/10 text-[#F97316] rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <UserPlus size={32} />
                  </div>
                  <h4 className="text-xl font-bold text-[#292524] mb-2">Manual Add</h4>
                  <p className="text-sm text-[#78716C] text-center">Enter the trainer's details and create their profile yourself.</p>
                </button>
                <button onClick={() => setHireMethod('invite')} className="flex flex-col items-center p-8 border-2 border-[#E7E5E4] rounded-2xl hover:border-[#F97316] hover:bg-[#FFFDF8] transition-all group text-left">
                  <div className="w-16 h-16 bg-[#F97316]/10 text-[#F97316] rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Mail size={32} />
                  </div>
                  <h4 className="text-xl font-bold text-[#292524] mb-2">Send Invitation</h4>
                  <p className="text-sm text-[#78716C] text-center">Send a secure invitation so the trainer can create and complete their own profile.</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manual Add Form Modal */}
      {showHireModal && hireMethod === 'manual' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#FFFFFF] rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-[#E7E5E4] overflow-hidden my-auto">
            <div className="p-6 border-b border-[#E7E5E4] flex justify-between items-center bg-white z-10 shrink-0">
              <div>
                <h2 className="text-2xl font-bold text-[#292524]">Manual Add Trainer</h2>
                <p className="text-xs text-[#78716C] mt-0.5">
                  {!otpVerified ? 'Step 1 of 2: Verify trainer email address with OTP' : 'Step 2 of 2: Complete trainer profile details'}
                </p>
              </div>
              <button 
                onClick={() => { setShowHireModal(false); setHireMethod(null); setOtpVerified(false); setOtpSent(false); setOtpInput(''); }} 
                className="text-[#78716C] hover:text-[#292524]"
              >
                <X size={24} />
              </button>
            </div>

            {/* Stepper Indicator */}
            <div className="px-6 py-3 border-b border-[#E7E5E4] bg-[#FFFDF8] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${otpVerified ? 'bg-emerald-600 text-white' : 'bg-[#F97316] text-white ring-4 ring-[#F97316]/10'}`}>
                  {otpVerified ? <Check size={14} /> : '1'}
                </span>
                <span className={`text-sm font-bold ${otpVerified ? 'text-emerald-700' : 'text-[#292524]'}`}>
                  Email Verification {otpVerified && '✓'}
                </span>
              </div>
              <div className="h-0.5 flex-1 mx-4 bg-gray-200">
                <div className={`h-full transition-all duration-500 ${otpVerified ? 'bg-emerald-600 w-full' : 'w-0'}`} />
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${otpVerified ? 'bg-[#F97316] text-white ring-4 ring-[#F97316]/10' : 'bg-gray-200 text-gray-500'}`}>
                  {otpVerified ? '2' : <Lock size={12} />}
                </span>
                <span className={`text-sm font-bold ${otpVerified ? 'text-[#292524]' : 'text-gray-400'}`}>
                  Trainer Information
                </span>
              </div>
            </div>

            <form onSubmit={handleManualAdd} className="p-6 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
              
              <section>
                <div className="flex items-center justify-between border-b pb-2 mb-4">
                  <h3 className="text-lg font-bold text-[#292524]">Basic Information</h3>
                  {!otpVerified ? (
                    <span className="text-xs font-semibold px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full flex items-center gap-1">
                      <Lock size={12} /> Email OTP Verification Required
                    </span>
                  ) : (
                    <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full flex items-center gap-1">
                      <Check size={12} /> Email Verified
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-[#78716C] mb-1">Full Name *</label>
                    <input 
                      required 
                      value={manualForm.name} 
                      onChange={e => setManualForm({...manualForm, name: e.target.value})} 
                      placeholder="e.g. John Doe"
                      className="w-full border border-[#E7E5E4] rounded-lg px-4 py-2 outline-none focus:border-[#F97316]" 
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="block text-sm font-bold text-[#78716C] mb-1">Email *</label>
                    <div className="flex space-x-2">
                      <input 
                        type="email" 
                        required 
                        value={manualForm.email} 
                        onChange={e => { setManualForm({...manualForm, email: e.target.value}); setOtpVerified(false); setOtpSent(false); }} 
                        disabled={otpVerified}
                        placeholder="trainer@example.com"
                        className="w-full border border-[#E7E5E4] rounded-lg px-4 py-2 outline-none focus:border-[#F97316] disabled:bg-gray-100 disabled:text-gray-700" 
                      />
                      {!otpVerified && (
                        <button 
                          type="button" 
                          onClick={() => { 
                            if(validateEmail(manualForm.email)) { 
                              setOtpSent(true); 
                              alert('Demo OTP generated: 123456'); 
                            } else { 
                              alert('Enter a valid email address first'); 
                            } 
                          }} 
                          className="px-3.5 py-2 bg-blue-100 text-blue-700 font-bold rounded-lg hover:bg-blue-200 text-sm whitespace-nowrap transition-colors"
                        >
                          {otpSent ? 'Resend OTP' : 'Send OTP'}
                        </button>
                      )}
                      {otpVerified && (
                        <div className="flex items-center gap-1.5 shrink-0">
                          <div className="px-3 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold rounded-lg flex items-center text-sm whitespace-nowrap">
                            <Check size={16} className="mr-1 text-emerald-600"/> Verified
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setOtpVerified(false);
                              setOtpSent(false);
                              setOtpInput('');
                            }}
                            className="px-2.5 py-2 text-xs font-semibold text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
                            title="Change email and re-verify"
                          >
                            Change
                          </button>
                        </div>
                      )}
                    </div>
                    {otpSent && !otpVerified && (
                      <div className="mt-2.5 flex space-x-2">
                        <input 
                          type="text" 
                          placeholder="Enter OTP (123456)" 
                          value={otpInput} 
                          onChange={e => setOtpInput(e.target.value)} 
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              if (otpInput.trim() === '123456') {
                                setOtpVerified(true);
                                setOtpSent(false);
                                setOtpInput('');
                                alert('Email Verified successfully! You can now complete the trainer details.');
                              } else {
                                alert('Invalid OTP. Please enter 123456');
                              }
                            }
                          }}
                          className="w-full border border-blue-300 rounded-lg px-4 py-2 outline-none focus:border-[#F97316] bg-blue-50/30" 
                        />
                        <button 
                          type="button" 
                          onClick={() => { 
                            if(otpInput.trim() === '123456') { 
                              setOtpVerified(true); 
                              setOtpSent(false); 
                              setOtpInput(''); 
                              alert('Email Verified successfully! You can now complete the trainer details.'); 
                            } else { 
                              alert('Invalid OTP. Please enter 123456'); 
                            } 
                          }} 
                          className="px-4 py-2 bg-[#F97316] text-white font-bold rounded-lg hover:bg-[#EA580C] text-sm whitespace-nowrap shadow-sm transition-colors"
                        >
                          Verify
                        </button>
                      </div>
                    )}
                  </div>

                  {!otpVerified ? (
                    <div className="md:col-span-2 p-5 bg-amber-50/80 border border-amber-200/90 rounded-2xl flex items-start gap-3.5 text-amber-900 mt-2">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0 text-amber-800 mt-0.5">
                        <Lock size={20} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-sm text-amber-900">Email OTP Verification Required</h4>
                        <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                          {otpSent 
                            ? 'Please enter the 6-digit OTP (Demo OTP: 123456) and click "Verify". Once the mail OTP is completed, you can proceed to fill the rest of the form (password, contact, and professional details).'
                            : 'Please enter the email address above and click "Send OTP". Once the mail OTP is completed, the remaining fields will unlock.'}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="md:col-span-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-emerald-800 mb-2">
                        <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 text-emerald-700">
                          <Check size={14} />
                        </div>
                        <p className="text-xs font-semibold text-emerald-800">
                          Email OTP completed successfully! You can now fill in the remaining trainer details below.
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-[#78716C] mb-1">Password *</label>
                        <div className="relative">
                          <input type={showPassword ? "text" : "password"} required value={manualForm.password} onChange={e => setManualForm({...manualForm, password: e.target.value})} className="w-full border border-[#E7E5E4] rounded-lg px-4 py-2 outline-none focus:border-[#F97316] pr-10" placeholder="Trainer login password" />
                          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#78716C] hover:text-[#F97316] focus:outline-none">
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-[#78716C] mb-1">Confirm Password *</label>
                        <div className="relative">
                          <input type={showConfirmPassword ? "text" : "password"} required value={manualForm.confirmPassword} onChange={e => setManualForm({...manualForm, confirmPassword: e.target.value})} className="w-full border border-[#E7E5E4] rounded-lg px-4 py-2 outline-none focus:border-[#F97316] pr-10" placeholder="Confirm password" />
                          <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#78716C] hover:text-[#F97316] focus:outline-none">
                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-[#78716C] mb-1">Phone Number *</label>
                        <input required type="text" maxLength={10} placeholder="10-digit number" value={manualForm.phone} onChange={e => setManualForm({...manualForm, phone: e.target.value.replace(/\D/g, '')})} className="w-full border border-[#E7E5E4] rounded-lg px-4 py-2 outline-none focus:border-[#F97316]" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-[#78716C] mb-1">Trainer Mode *</label>
                        <select required value={manualForm.trainingMode} onChange={e => setManualForm({...manualForm, trainingMode: e.target.value})} className="w-full border border-[#E7E5E4] rounded-lg px-4 py-2 outline-none focus:border-[#F97316]">
                          {renderTrainerModeOptions()}
                        </select>
                      </div>
                    </>
                  )}
                </div>
              </section>

              {otpVerified && (
                <>
                  <section>
                    <h3 className="text-lg font-bold text-[#292524] mb-4 border-b pb-2">Professional Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-[#78716C] mb-1">Specialization *</label>
                        <input required value={manualForm.specialization} onChange={e => setManualForm({...manualForm, specialization: e.target.value})} className="w-full border border-[#E7E5E4] rounded-lg px-4 py-2 outline-none focus:border-[#F97316]" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-[#78716C] mb-1">Experience (Years)</label>
                        <input type="number" value={manualForm.experience} onChange={e => setManualForm({...manualForm, experience: e.target.value})} className="w-full border border-[#E7E5E4] rounded-lg px-4 py-2 outline-none focus:border-[#F97316]" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-[#78716C] mb-1">Qualifications *</label>
                        <input required value={manualForm.qualifications} onChange={e => setManualForm({...manualForm, qualifications: e.target.value})} className="w-full border border-[#E7E5E4] rounded-lg px-4 py-2 outline-none focus:border-[#F97316]" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-[#78716C] mb-1">Certifications</label>
                        <input value={manualForm.certifications} onChange={e => setManualForm({...manualForm, certifications: e.target.value})} className="w-full border border-[#E7E5E4] rounded-lg px-4 py-2 outline-none focus:border-[#F97316]" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-[#78716C] mb-1">Areas of Expertise *</label>
                        <textarea required rows={2} value={manualForm.expertise} onChange={e => setManualForm({...manualForm, expertise: e.target.value})} className="w-full border border-[#E7E5E4] rounded-lg px-4 py-2 outline-none focus:border-[#F97316]" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-[#78716C] mb-1">Short Bio</label>
                        <textarea rows={3} value={manualForm.bio} onChange={e => setManualForm({...manualForm, bio: e.target.value})} className="w-full border border-[#E7E5E4] rounded-lg px-4 py-2 outline-none focus:border-[#F97316]" />
                      </div>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-lg font-bold text-[#292524] mb-4 border-b pb-2">Availability Settings</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-[#78716C] mb-1">Available Days</label>
                        <select value={manualForm.availableDays} onChange={e => setManualForm({...manualForm, availableDays: e.target.value})} className="w-full border border-[#E7E5E4] rounded-lg px-4 py-2 outline-none focus:border-[#F97316]">
                          <option value="Monday to Friday">Monday to Friday</option>
                          <option value="Monday to Saturday">Monday to Saturday</option>
                          <option value="Weekends (Sat & Sun)">Weekends (Sat & Sun)</option>
                          <option value="Everyday">Everyday</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-[#78716C] mb-1">Available Slots per Day</label>
                        <input type="number" min="1" placeholder="e.g. 5" value={manualForm.availableSlot} onChange={e => setManualForm({...manualForm, availableSlot: e.target.value})} className="w-full border border-[#E7E5E4] rounded-lg px-4 py-2 outline-none focus:border-[#F97316]" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-[#78716C] mb-1">Start Time</label>
                        <select value={manualForm.availableStartTime} onChange={e => setManualForm({...manualForm, availableStartTime: e.target.value})} className="w-full border border-[#E7E5E4] rounded-lg px-4 py-2 outline-none focus:border-[#F97316]">
                          {renderTimeOptions()}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-[#78716C] mb-1">End Time</label>
                        <select value={manualForm.availableEndTime} onChange={e => setManualForm({...manualForm, availableEndTime: e.target.value})} className="w-full border border-[#E7E5E4] rounded-lg px-4 py-2 outline-none focus:border-[#F97316]">
                          {renderTimeOptions()}
                        </select>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-lg font-bold text-[#292524] mb-4 border-b pb-2">Employment / Payment</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-[#78716C] mb-1">Trainer Fee</label>
                        <input type="number" value={manualForm.fee} onChange={e => setManualForm({...manualForm, fee: e.target.value})} className="w-full border border-[#E7E5E4] rounded-lg px-4 py-2 outline-none focus:border-[#F97316]" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-[#78716C] mb-1">Payment Type</label>
                        <select value={manualForm.paymentType} onChange={e => setManualForm({...manualForm, paymentType: e.target.value})} className="w-full border border-[#E7E5E4] rounded-lg px-4 py-2 outline-none focus:border-[#F97316]">
                          <option value="Per Week">Per Week</option>
                          <option value="Per Month">Per Month</option>
                        </select>
                      </div>
                    </div>
                  </section>
                </>
              )}

              <div className="flex justify-end space-x-3 p-4 border-t border-[#E7E5E4] bg-[#FFFDF8] shrink-0">
                <button 
                  type="button" 
                  onClick={() => { setShowHireModal(false); setHireMethod(null); setOtpVerified(false); setOtpSent(false); setOtpInput(''); }} 
                  className="px-6 py-2 text-[#78716C] font-bold hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                {otpVerified ? (
                  <button 
                    type="submit" 
                    className="px-8 py-2 bg-[#F97316] text-white rounded-xl font-bold hover:bg-[#EA580C] transition-colors shadow-lg shadow-[#F97316]/20"
                  >
                    Add Trainer
                  </button>
                ) : (
                  <button 
                    type="button" 
                    disabled 
                    className="px-6 py-2 bg-gray-200 text-gray-400 rounded-xl font-bold cursor-not-allowed flex items-center gap-2"
                  >
                    <Lock size={16} /> Complete Email OTP First
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Send Invitation Form Modal */}
      {showHireModal && hireMethod === 'invite' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#FFFFFF] rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-[#E7E5E4] overflow-hidden my-auto">
            <div className="p-6 border-b border-[#E7E5E4] flex justify-between items-center bg-white z-10 shrink-0">
              <h2 className="text-2xl font-bold text-[#292524]">Invite New Trainer</h2>
              <button onClick={() => { setShowHireModal(false); setHireMethod(null); }} className="text-[#78716C] hover:text-[#292524]"><X size={24} /></button>
            </div>
            <form onSubmit={handleSendInvite} className="p-6 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-[#78716C] mb-1">Trainer Name *</label>
                  <input required value={inviteForm.trainerName} onChange={e => setInviteForm({...inviteForm, trainerName: e.target.value})} className="w-full border border-[#E7E5E4] rounded-lg px-4 py-2 outline-none focus:border-[#F97316]" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#78716C] mb-1">Email Address *</label>
                  <input type="email" required value={inviteForm.email} onChange={e => setInviteForm({...inviteForm, email: e.target.value})} className="w-full border border-[#E7E5E4] rounded-lg px-4 py-2 outline-none focus:border-[#F97316]" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#78716C] mb-1">Phone Number</label>
                  <input type="text" maxLength={10} placeholder="10-digit number" value={inviteForm.phone} onChange={e => setInviteForm({...inviteForm, phone: e.target.value.replace(/\D/g, '')})} className="w-full border border-[#E7E5E4] rounded-lg px-4 py-2 outline-none focus:border-[#F97316]" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#78716C] mb-1">Specialization</label>
                  <input value={inviteForm.specialization} onChange={e => setInviteForm({...inviteForm, specialization: e.target.value})} className="w-full border border-[#E7E5E4] rounded-lg px-4 py-2 outline-none focus:border-[#F97316]" />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-[#78716C] mb-1">Personal Message</label>
                  <textarea rows={3} placeholder="Add a personal note to the email invitation..." value={inviteForm.personalMessage} onChange={e => setInviteForm({...inviteForm, personalMessage: e.target.value})} className="w-full border border-[#E7E5E4] rounded-lg px-4 py-2 outline-none focus:border-[#F97316]" />
                </div>
              </div>

              <div className="flex justify-end space-x-3 p-4 border-t border-[#E7E5E4] bg-[#FFFDF8] shrink-0">
                <button type="button" onClick={() => { setShowHireModal(false); setHireMethod(null); }} className="px-6 py-2 text-[#78716C] font-bold hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
                <button type="submit" className="px-8 py-2 bg-[#F97316] text-white rounded-xl font-bold hover:bg-[#EA580C] transition-colors shadow-lg shadow-[#F97316]/20 flex items-center gap-2">
                  <Mail size={18} /> Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Trainer View Modal */}
      {selectedTrainer && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#FFFFFF] rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-[#E7E5E4] my-auto">
            {/* Header */}
            <div className="p-6 border-b border-[#E7E5E4] flex justify-between items-center bg-[#FFFDF8] shrink-0">
              <h2 className="text-xl font-bold text-[#292524]">Trainer Profile</h2>
              <button
                onClick={() => setSelectedTrainer(null)}
                className="p-1.5 rounded-lg text-[#78716C] hover:text-[#292524] hover:bg-slate-200 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
              {/* Avatar + Name + Status */}
              <div className="flex items-center space-x-4 pb-4 border-b border-[#E2E8F0]">
                {selectedTrainer.profilePhoto ? (
                  <img src={selectedTrainer.profilePhoto} alt={selectedTrainer.name} className="w-20 h-20 rounded-full object-cover border-2 border-[#E7E5E4] shrink-0" />
                ) : (
                  <div className="w-20 h-20 bg-[#F97316]/10 text-[#F97316] rounded-full flex items-center justify-center text-3xl font-bold shrink-0 border-2 border-[#E7E5E4]">
                    {selectedTrainer.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h3 className="text-2xl font-bold text-[#292524]">{selectedTrainer.name}</h3>
                  <p className="text-[#78716C] text-sm mt-0.5">{selectedTrainer.specialization}</p>
                  <span className={`mt-2 inline-block px-3 py-1 rounded-full text-xs font-bold border ${selectedTrainer.status === 'Active' ? 'bg-[#F97316]/10 text-[#F97316] border-[#F97316]/20' : selectedTrainer.status === 'Pending' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' : 'bg-red-500/10 text-[#FED7AA] border-red-500/20'}`}>
                    {selectedTrainer.status}
                  </span>
                </div>
              </div>

              {/* Section: Contact Info - Contiguous touching one by one */}
              <div>
                <h4 className="text-xs font-bold text-[#78716C] uppercase tracking-wider mb-2">Contact Information</h4>
                <div className="border border-[#E7E5E4] rounded-xl overflow-hidden divide-y divide-[#E7E5E4] bg-white shadow-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-[#E7E5E4]">
                    <div className="p-3.5 bg-white">
                      <p className="text-[#78716C] text-[11px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <Mail size={12} className="text-[#F97316]" />
                        <span>Email</span>
                      </p>
                      <p className="font-semibold text-[#292524] text-sm break-all">{selectedTrainer.email || 'N/A'}</p>
                    </div>
                    <div className="p-3.5 bg-white">
                      <p className="text-[#78716C] text-[11px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <Phone size={12} className="text-[#F97316]" />
                        <span>Phone</span>
                      </p>
                      <p className="font-semibold text-[#292524] text-sm">{selectedTrainer.phone || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section: Professional Info - Contiguous touching one by one */}
              <div>
                <h4 className="text-xs font-bold text-[#78716C] uppercase tracking-wider mb-2">Professional Details</h4>
                <div className="border border-[#E7E5E4] rounded-xl overflow-hidden divide-y divide-[#E7E5E4] bg-white shadow-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-[#E7E5E4]">
                    <div className="p-3.5 bg-white">
                      <p className="text-[#78716C] text-[11px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <Dumbbell size={12} className="text-[#F97316]" />
                        <span>Specialization</span>
                      </p>
                      <p className="font-semibold text-[#292524] text-sm">{selectedTrainer.specialization || 'N/A'}</p>
                    </div>
                    <div className="p-3.5 bg-white">
                      <p className="text-[#78716C] text-[11px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <Briefcase size={12} className="text-[#F97316]" />
                        <span>Experience</span>
                      </p>
                      <p className="font-semibold text-[#292524] text-sm">{selectedTrainer.experience ? `${selectedTrainer.experience} Years` : 'N/A'}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-[#E7E5E4]">
                    <div className="p-3.5 bg-white">
                      <p className="text-[#78716C] text-[11px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <Activity size={12} className="text-[#F97316]" />
                        <span>Training Mode</span>
                      </p>
                      <p className="font-semibold text-[#292524] text-sm capitalize">{selectedTrainer.trainingMode || 'N/A'}</p>
                    </div>
                    <div className="p-3.5 bg-white">
                      <p className="text-[#78716C] text-[11px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <GraduationCap size={12} className="text-[#F97316]" />
                        <span>Qualifications</span>
                      </p>
                      <p className="font-semibold text-[#292524] text-sm">{selectedTrainer.qualifications || 'N/A'}</p>
                    </div>
                  </div>
                  {selectedTrainer.certifications && (
                    <div className="p-3.5 bg-white">
                      <p className="text-[#78716C] text-[11px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <Award size={12} className="text-[#F97316]" />
                        <span>Certifications</span>
                      </p>
                      <p className="font-semibold text-[#292524] text-sm">{selectedTrainer.certifications}</p>
                    </div>
                  )}
                  {selectedTrainer.expertise && (
                    <div className="p-3.5 bg-white">
                      <p className="text-[#78716C] text-[11px] font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <Sparkles size={12} className="text-[#F97316]" />
                        <span>Areas of Expertise</span>
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {getExpertiseList(selectedTrainer.expertise).map((item, idx) => (
                          <span key={idx} className="px-2.5 py-0.5 bg-[#FFFDF8] border border-[#E7E5E4] text-[#292524] text-xs font-semibold rounded-md">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Section: Fee Info - Contiguous touching one by one */}
              <div>
                <h4 className="text-xs font-bold text-[#78716C] uppercase tracking-wider mb-2">Fee & Payment</h4>
                <div className="border border-[#E7E5E4] rounded-xl overflow-hidden divide-y divide-[#E7E5E4] bg-white shadow-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-[#E7E5E4]">
                    <div className="p-3.5 bg-white">
                      <p className="text-[#78716C] text-[11px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <IndianRupee size={12} className="text-[#F97316]" />
                        <span>Fee</span>
                      </p>
                      <p className="font-bold text-[#F97316] text-sm">{selectedTrainer.fee ? `₹${selectedTrainer.fee}` : 'N/A'}</p>
                    </div>
                    <div className="p-3.5 bg-white">
                      <p className="text-[#78716C] text-[11px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <Clock size={12} className="text-[#F97316]" />
                        <span>Payment Type</span>
                      </p>
                      <p className="font-semibold text-[#292524] text-sm">{selectedTrainer.paymentType || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section: Availability - Contiguous touching one by one */}
              <div>
                <h4 className="text-xs font-bold text-[#78716C] uppercase tracking-wider mb-2">Availability</h4>
                <div className="border border-[#E7E5E4] rounded-xl overflow-hidden divide-y divide-[#E7E5E4] bg-white shadow-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-[#E7E5E4]">
                    <div className="p-3.5 bg-white">
                      <p className="text-[#78716C] text-[11px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <Calendar size={12} className="text-[#F97316]" />
                        <span>Available Days</span>
                      </p>
                      <p className="font-semibold text-[#292524] text-sm">{selectedTrainer.availableDays || selectedTrainer.availability?.days || 'N/A'}</p>
                    </div>
                    <div className="p-3.5 bg-white">
                      <p className="text-[#78716C] text-[11px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <Clock size={12} className="text-[#F97316]" />
                        <span>Timings</span>
                      </p>
                      <p className="font-semibold text-[#292524] text-sm">
                        {selectedTrainer.availableStartTime || selectedTrainer.availability?.startTime || '—'}
                        {(selectedTrainer.availableStartTime || selectedTrainer.availability?.startTime) ? ' → ' : ''}
                        {selectedTrainer.availableEndTime || selectedTrainer.availability?.endTime || 'N/A'}
                      </p>
                    </div>
                  </div>
                  {(selectedTrainer.availableSlot || selectedTrainer.availability?.slot) && (
                    <div className="p-3.5 bg-white">
                      <p className="text-[#78716C] text-[11px] font-bold uppercase tracking-wider mb-1">Slot Duration</p>
                      <p className="font-semibold text-[#292524] text-sm">{selectedTrainer.availableSlot || selectedTrainer.availability?.slot}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Section: Bio */}
              {selectedTrainer.bio && (
                <div>
                  <h4 className="text-xs font-bold text-[#78716C] uppercase tracking-wider mb-2">About</h4>
                  <div className="border border-[#E7E5E4] rounded-xl p-4 bg-white shadow-sm">
                    <p className="text-[#292524] text-sm leading-relaxed">{selectedTrainer.bio}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-[#FFFDF8] border-t border-[#E7E5E4] flex justify-end shrink-0">
              <button
                onClick={() => setSelectedTrainer(null)}
                className="px-6 py-2 bg-white border border-[#E7E5E4] text-[#292524] rounded-xl font-bold hover:bg-slate-100 transition-colors shadow-2xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Trainer Form Modal */}
      {editTrainer && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#FFFFFF] rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-[#E7E5E4] overflow-hidden my-auto">
            <div className="p-6 border-b border-[#E7E5E4] flex justify-between items-center bg-white z-10 shrink-0">
              <h2 className="text-2xl font-bold text-[#292524]">Edit Trainer</h2>
              <button onClick={() => setEditTrainer(null)} className="text-[#78716C] hover:text-[#292524]"><X size={24} /></button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
              
              <section>
                <h3 className="text-lg font-bold text-[#292524] mb-4 border-b pb-2">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-[#78716C] mb-1">Full Name *</label>
                    <input required value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="w-full border border-[#E7E5E4] rounded-lg px-4 py-2 outline-none focus:border-[#F97316]" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#78716C] mb-1">Email *</label>
                    <input type="email" required value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} className="w-full border border-[#E7E5E4] rounded-lg px-4 py-2 outline-none focus:border-[#F97316]" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#78716C] mb-1">Phone Number *</label>
                    <input required type="text" maxLength={10} placeholder="10-digit number" value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value.replace(/\D/g, '')})} className="w-full border border-[#E7E5E4] rounded-lg px-4 py-2 outline-none focus:border-[#F97316]" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#78716C] mb-1">Trainer Mode *</label>
                    <select required value={editForm.trainingMode} onChange={e => setEditForm({...editForm, trainingMode: e.target.value})} className="w-full border border-[#E7E5E4] rounded-lg px-4 py-2 outline-none focus:border-[#F97316]">
                      {renderTrainerModeOptions()}
                    </select>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-bold text-[#292524] mb-4 border-b pb-2">Professional Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-[#78716C] mb-1">Specialization *</label>
                    <input required value={editForm.specialization} onChange={e => setEditForm({...editForm, specialization: e.target.value})} className="w-full border border-[#E7E5E4] rounded-lg px-4 py-2 outline-none focus:border-[#F97316]" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#78716C] mb-1">Experience (Years)</label>
                    <input type="number" value={editForm.experience} onChange={e => setEditForm({...editForm, experience: e.target.value})} className="w-full border border-[#E7E5E4] rounded-lg px-4 py-2 outline-none focus:border-[#F97316]" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#78716C] mb-1">Qualifications *</label>
                    <input required value={editForm.qualifications} onChange={e => setEditForm({...editForm, qualifications: e.target.value})} className="w-full border border-[#E7E5E4] rounded-lg px-4 py-2 outline-none focus:border-[#F97316]" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#78716C] mb-1">Certifications</label>
                    <input value={editForm.certifications} onChange={e => setEditForm({...editForm, certifications: e.target.value})} className="w-full border border-[#E7E5E4] rounded-lg px-4 py-2 outline-none focus:border-[#F97316]" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-[#78716C] mb-1">Areas of Expertise *</label>
                    <textarea required rows={2} value={editForm.expertise} onChange={e => setEditForm({...editForm, expertise: e.target.value})} className="w-full border border-[#E7E5E4] rounded-lg px-4 py-2 outline-none focus:border-[#F97316]" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-[#78716C] mb-1">Short Bio</label>
                    <textarea rows={3} value={editForm.bio} onChange={e => setEditForm({...editForm, bio: e.target.value})} className="w-full border border-[#E7E5E4] rounded-lg px-4 py-2 outline-none focus:border-[#F97316]" />
                  </div>
                </div>
              </section>
              <section>
                <h3 className="text-lg font-bold text-[#292524] mb-4 border-b pb-2">Availability Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-[#78716C] mb-1">Available Days</label>
                    <select value={editForm.availableDays} onChange={e => setEditForm({...editForm, availableDays: e.target.value})} className="w-full border border-[#E7E5E4] rounded-lg px-4 py-2 outline-none focus:border-[#F97316]">
                      <option value="Monday to Friday">Monday to Friday</option>
                      <option value="Monday to Saturday">Monday to Saturday</option>
                      <option value="Weekends (Sat & Sun)">Weekends (Sat & Sun)</option>
                      <option value="Everyday">Everyday</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#78716C] mb-1">Available Slots per Day</label>
                    <input type="number" min="1" placeholder="e.g. 5" value={editForm.availableSlot} onChange={e => setEditForm({...editForm, availableSlot: e.target.value})} className="w-full border border-[#E7E5E4] rounded-lg px-4 py-2 outline-none focus:border-[#F97316]" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#78716C] mb-1">Start Time</label>
                    <select value={editForm.availableStartTime} onChange={e => setEditForm({...editForm, availableStartTime: e.target.value})} className="w-full border border-[#E7E5E4] rounded-lg px-4 py-2 outline-none focus:border-[#F97316]">
                      {renderTimeOptions()}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#78716C] mb-1">End Time</label>
                    <select value={editForm.availableEndTime} onChange={e => setEditForm({...editForm, availableEndTime: e.target.value})} className="w-full border border-[#E7E5E4] rounded-lg px-4 py-2 outline-none focus:border-[#F97316]">
                      {renderTimeOptions()}
                    </select>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-bold text-[#292524] mb-4 border-b pb-2">Employment / Payment</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-[#78716C] mb-1">Trainer Fee</label>
                    <input type="number" value={editForm.fee} onChange={e => setEditForm({...editForm, fee: e.target.value})} className="w-full border border-[#E7E5E4] rounded-lg px-4 py-2 outline-none focus:border-[#F97316]" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#78716C] mb-1">Payment Type</label>
                    <select value={editForm.paymentType} onChange={e => setEditForm({...editForm, paymentType: e.target.value})} className="w-full border border-[#E7E5E4] rounded-lg px-4 py-2 outline-none focus:border-[#F97316]">
                      <option value="Per Week">Per Week</option>
                      <option value="Per Month">Per Month</option>
                    </select>
                  </div>
                </div>
              </section>

              <div className="flex justify-end space-x-3 p-4 border-t border-[#E7E5E4] bg-[#FFFDF8] shrink-0">
                <button type="button" onClick={() => setEditTrainer(null)} className="px-6 py-2 text-[#78716C] font-bold hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
                <button type="submit" className="px-8 py-2 bg-[#F97316] text-white rounded-xl font-bold hover:bg-[#EA580C] transition-colors shadow-lg shadow-orange-600/20">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Upgrade Prompt Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl max-w-md w-full p-8 text-center shadow-2xl relative">
            <button 
              onClick={() => setShowUpgradeModal(false)}
              className="absolute top-4 right-4 text-[#78716C] hover:text-[#F97316] transition-colors"
            >
              <X size={20} />
            </button>
            
            <div className="w-16 h-16 bg-[#FED7AA]/10 border border-[#FED7AA]/20 text-[#FED7AA] rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldCheck size={32} />
            </div>
            
            <h2 className="text-2xl font-bold text-[#292524] mb-3">Trainer Limit Reached</h2>
            <p className="text-[#78716C] mb-8 leading-relaxed">
              Your current <span className="text-[#F97316] font-semibold">{user?.subscriptionPlan || 'Free Trial'}</span> plan allows up to {getTrainerLimit(user?.subscriptionPlan)} trainers. If you want to add more trainers and branches, you need to upgrade your subscription plan.
            </p>
            
            <div className="space-y-3">
              <button 
                onClick={() => navigate('/admin/subscription')} 
                className="w-full py-3.5 bg-[#F97316] text-white font-bold rounded-xl hover:bg-[#EA580C] transition-colors shadow-lg shadow-[#F97316]/20"
              >
                View Upgrade Plans
              </button>
              <button 
                onClick={() => setShowUpgradeModal(false)} 
                className="w-full py-3.5 bg-[#FFFFFF] text-[#292524] font-medium rounded-xl border border-[#E7E5E4] hover:bg-[#FED7AA] transition-colors"
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
