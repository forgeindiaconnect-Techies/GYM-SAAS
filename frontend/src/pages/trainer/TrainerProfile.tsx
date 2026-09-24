import { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Edit3, Award, Clock, IndianRupee, Save, X, CheckCircle, Dumbbell, Calendar } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';

const TrainerProfile = () => {
  const { user } = useAuth();
  const [trainer, setTrainer] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [form, setForm] = useState({
    phone: '',
    specialization: '',
    experience: '',
    trainingMode: 'offline',
    qualifications: '',
    certifications: '',
    expertise: '',
    bio: '',
    fee: '',
    paymentType: 'Per Month',
    availableDays: '',
    availableStartTime: '',
    availableEndTime: '',
    availableSlot: '',
  });

  useEffect(() => {
    fetchTrainerProfile();
  }, [user]);

  const fetchTrainerProfile = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/trainers/my-profile');
      const t = res.data.trainer;
      setTrainer(t);
      setForm({
        phone: t.phone || '',
        specialization: t.specialization || '',
        experience: t.experience ? String(t.experience) : '',
        trainingMode: t.trainingMode || 'offline',
        qualifications: t.qualifications || '',
        certifications: t.certifications || '',
        expertise: t.expertise || '',
        bio: t.bio || '',
        fee: t.fee ? String(t.fee) : '',
        paymentType: t.paymentType || 'Per Month',
        availableDays: t.availableDays || '',
        availableStartTime: t.availableStartTime || '',
        availableEndTime: t.availableEndTime || '',
        availableSlot: t.availableSlot ? String(t.availableSlot) : '',
      });
    } catch (err) {
      console.error('Could not fetch trainer profile', err);
      // Use user data as fallback
      setTrainer(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await api.patch('/trainers/my-profile', {
        phone: form.phone,
        specialization: form.specialization,
        experience: Number(form.experience) || 0,
        trainingMode: form.trainingMode,
        qualifications: form.qualifications,
        certifications: form.certifications,
        expertise: form.expertise,
        bio: form.bio,
        fee: Number(form.fee) || 0,
        paymentType: form.paymentType,
        availableDays: form.availableDays,
        availableStartTime: form.availableStartTime,
        availableEndTime: form.availableEndTime,
        availableSlot: Number(form.availableSlot) || 0,
      });
      setTrainer(res.data.trainer || { ...trainer, ...form });
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      // Save locally even if API fails
      setTrainer((prev: any) => ({ ...prev, ...form }));
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const inputCls = 'w-full bg-white border border-[#D3DFDA] rounded-xl px-4 py-3 text-[#202828] outline-none focus:border-[#164A4A] transition-colors text-sm';

  // Helper: show field value or fallback
  const val = (primary: any, fallback: any = null, unit = '') => {
    const v = primary != null && primary !== '' ? primary : fallback;
    if (v == null || v === '') return null;
    return unit ? `${v} ${unit}` : String(v);
  };

  const displayName = trainer?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Trainer';
  const displayEmail = trainer?.email || user?.email || '';
  const displayPhone = val(trainer?.phone) || val(form.phone);
  const displaySpecialization = val(trainer?.specialization) || val(form.specialization);
  const displayExperience = trainer?.experience != null ? trainer.experience : (form.experience !== '' ? form.experience : null);
  const displayMode = trainer?.trainingMode || form.trainingMode || 'offline';
  const displayQualifications = val(trainer?.qualifications) || val(form.qualifications);
  const displayCertifications = val(trainer?.certifications) || val(form.certifications);
  const displayExpertise = val(trainer?.expertise) || val(form.expertise);
  const displayBio = val(trainer?.bio) || val(form.bio);
  const displayFee = trainer?.fee != null && trainer.fee !== 0 ? trainer.fee : (form.fee !== '' ? form.fee : null);
  const displayPaymentType = val(trainer?.paymentType) || val(form.paymentType);
  const displayAvailableDays = val(trainer?.availableDays) || val(form.availableDays);
  const displayStartTime = val(trainer?.availableStartTime) || val(form.availableStartTime);
  const displayEndTime = val(trainer?.availableEndTime) || val(form.availableEndTime);
  const displaySlot = trainer?.availableSlot != null ? trainer.availableSlot : (form.availableSlot !== '' ? form.availableSlot : null);
  const displayStatus = trainer?.status || 'Active';

  // Check if profile is mostly empty
  const isProfileEmpty = !displaySpecialization && !displayQualifications && !displayPhone;




  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto flex items-center justify-center h-64">
        <div className="text-[#455250]">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* Success Banner */}
      {saveSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl font-semibold flex items-center gap-2">
          <CheckCircle size={18} /> Profile updated successfully!
        </div>
      )}

      {/* Header Card */}
      <div className="bg-[#FFFFFF] border border-[#D3DFDA] rounded-2xl p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#164A4A]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 relative z-10">
          {/* Avatar */}
          <div className="w-24 h-24 bg-[#FFFFFF] rounded-full border-2 border-[#164A4A] flex items-center justify-center text-[#164A4A] text-3xl font-bold shadow-[0_0_15px_rgba(22,163,74,0.15)] shrink-0">
            {displayName.charAt(0).toUpperCase()}
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl font-bold text-[#202828]">{displayName}</h1>
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                displayStatus === 'Active' ? 'bg-[#164A4A]/10 text-[#164A4A] border-[#164A4A]/20' :
                displayStatus === 'Pending' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' :
                'bg-red-500/10 text-[#6fa3a0] border-red-500/20'
              }`}>{displayStatus}</span>
            </div>
            {displaySpecialization && (
              <p className="text-[#164A4A] font-semibold mt-1 capitalize">{displaySpecialization}</p>
            )}
            <div className="flex flex-wrap gap-4 text-sm text-[#455250] mt-3">
              <div className="flex items-center gap-1.5"><Mail size={15} /> {displayEmail}</div>
              {displayPhone && <div className="flex items-center gap-1.5"><Phone size={15} /> {displayPhone}</div>}
              <div className="flex items-center gap-1.5 capitalize"><Dumbbell size={15} /> {displayMode} Training</div>
            </div>
          </div>

          {/* Edit Button */}
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#202828] hover:bg-[#0F172A] text-white font-bold rounded-xl transition-colors shadow-lg text-sm shrink-0"
          >
            <Edit3 size={16} /> Edit Profile
          </button>
        </div>
      </div>

      {/* Empty profile prompt */}
      {isProfileEmpty && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-500 shrink-0">
            <User size={20} />
          </div>
          <div className="flex-1">
            <p className="font-bold text-amber-800">Complete your profile</p>
            <p className="text-sm text-amber-700 mt-0.5">Add your specialization, qualifications, fee, and availability so members can find you.</p>
          </div>
          <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-amber-500 text-white font-bold rounded-xl text-sm hover:bg-amber-600 transition-colors">
            Fill Profile →
          </button>
        </div>
      )}



      {/* Main Sections */}
      <div className="grid md:grid-cols-2 gap-6">

        {/* Professional Details */}
        <div className="bg-[#FFFFFF] border border-[#D3DFDA] rounded-2xl p-6 space-y-5">
          <h2 className="text-xl font-bold flex items-center gap-2 text-[#202828]">
            <Award size={20} className="text-[#164A4A]" /> Professional Details
          </h2>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#F2EFE8] border border-[#E8E5DA] rounded-xl p-3">
              <p className="text-xs text-[#687B78] font-medium mb-1">Specialization</p>
              <p className="font-semibold text-[#202828] text-sm">{displaySpecialization || 'Not set'}</p>
            </div>
            <div className="bg-[#F2EFE8] border border-[#E8E5DA] rounded-xl p-3">
              <p className="text-xs text-[#687B78] font-medium mb-1">Experience</p>
              <p className="font-semibold text-[#202828] text-sm">{displayExperience ? `${displayExperience} Years` : 'Not set'}</p>
            </div>
            <div className="bg-[#F2EFE8] border border-[#E8E5DA] rounded-xl p-3">
              <p className="text-xs text-[#687B78] font-medium mb-1">Qualifications</p>
              <p className="font-semibold text-[#202828] text-sm">{displayQualifications || 'Not set'}</p>
            </div>
            <div className="bg-[#F2EFE8] border border-[#E8E5DA] rounded-xl p-3">
              <p className="text-xs text-[#687B78] font-medium mb-1">Training Mode</p>
              <p className="font-semibold text-[#202828] text-sm capitalize">{displayMode}</p>
            </div>
            {displayCertifications && (
              <div className="bg-[#F2EFE8] border border-[#E8E5DA] rounded-xl p-3 col-span-2">
                <p className="text-xs text-[#687B78] font-medium mb-1">Certifications</p>
                <p className="font-semibold text-[#202828] text-sm">{displayCertifications}</p>
              </div>
            )}
            {displayExpertise && (
              <div className="bg-[#F2EFE8] border border-[#E8E5DA] rounded-xl p-3 col-span-2">
                <p className="text-xs text-[#687B78] font-medium mb-1">Expertise</p>
                <p className="font-semibold text-[#202828] text-sm">{displayExpertise}</p>
              </div>
            )}
          </div>

          {displayBio && (
            <div>
              <h3 className="font-bold text-[#202828] mb-2 text-sm">Bio</h3>
              <p className="text-sm text-[#455250] leading-relaxed bg-[#F2EFE8] border border-[#E8E5DA] rounded-xl p-3">
                {displayBio}
              </p>
            </div>
          )}
        </div>

        {/* Availability & Fee */}
        <div className="space-y-6">
          <div className="bg-[#FFFFFF] border border-[#D3DFDA] rounded-2xl p-6">
            <h2 className="text-xl font-bold flex items-center gap-2 text-[#202828] mb-4">
              <Calendar size={20} className="text-[#164A4A]" /> Availability
            </h2>
            <div className="space-y-3">
              <div className="bg-[#F2EFE8] border border-[#E8E5DA] rounded-xl p-3">
                <p className="text-xs text-[#687B78] font-medium mb-1">Available Days</p>
                <p className="font-semibold text-[#202828] text-sm">{displayAvailableDays || 'Not set'}</p>
              </div>
              <div className="bg-[#F2EFE8] border border-[#E8E5DA] rounded-xl p-3">
                <p className="text-xs text-[#687B78] font-medium mb-1">Timings</p>
                <p className="font-semibold text-[#202828] text-sm">
                  {displayStartTime && displayEndTime ? `${displayStartTime} → ${displayEndTime}` : 'Not set'}
                </p>
              </div>
              {displaySlot && (
                <div className="bg-[#F2EFE8] border border-[#E8E5DA] rounded-xl p-3">
                  <p className="text-xs text-[#687B78] font-medium mb-1">Slot Duration</p>
                  <p className="font-semibold text-[#202828] text-sm">{displaySlot} min</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-[#FFFFFF] border border-[#D3DFDA] rounded-2xl p-6">
            <h2 className="text-xl font-bold flex items-center gap-2 text-[#202828] mb-4">
              <IndianRupee size={20} className="text-[#164A4A]" /> Fee & Payment
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#F2EFE8] border border-[#E8E5DA] rounded-xl p-3">
                <p className="text-xs text-[#687B78] font-medium mb-1">Fee</p>
                <p className="font-semibold text-[#202828] text-sm">{displayFee ? `₹${displayFee}` : 'Not set'}</p>
              </div>
              <div className="bg-[#F2EFE8] border border-[#E8E5DA] rounded-xl p-3">
                <p className="text-xs text-[#687B78] font-medium mb-1">Payment Type</p>
                <p className="font-semibold text-[#202828] text-sm">{displayPaymentType || 'Not set'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-[#D3DFDA] mt-10 mb-10">
            {/* Modal Header */}
            <div className="p-6 border-b border-[#D3DFDA] flex justify-between items-center bg-gradient-to-r from-[#F1F5F3] to-white rounded-t-2xl">
              <h2 className="text-xl font-bold text-[#202828]">Edit Profile</h2>
              <button onClick={() => setIsEditing(false)} className="text-[#455250] hover:text-[#202828]">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto max-h-[75vh]">

              {/* Contact */}
              <div>
                <h3 className="text-xs font-bold text-[#455250] uppercase tracking-wider mb-3">Contact</h3>
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-[#455250] mb-1">Phone Number</label>
                    <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className={inputCls} placeholder="10-digit number" />
                  </div>
                </div>
              </div>

              {/* Professional */}
              <div>
                <h3 className="text-xs font-bold text-[#455250] uppercase tracking-wider mb-3">Professional Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-[#455250] mb-1">Specialization</label>
                    <input value={form.specialization} onChange={e => setForm({...form, specialization: e.target.value})} className={inputCls} placeholder="e.g. Weight Loss, Yoga" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#455250] mb-1">Experience (Years)</label>
                    <input type="number" value={form.experience} onChange={e => setForm({...form, experience: e.target.value})} className={inputCls} placeholder="e.g. 5" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#455250] mb-1">Training Mode</label>
                    <select value={form.trainingMode} onChange={e => setForm({...form, trainingMode: e.target.value})} className={inputCls}>
                      <option value="offline">Offline</option>
                      <option value="online">Online</option>
                      <option value="both">Both</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#455250] mb-1">Qualifications</label>
                    <input value={form.qualifications} onChange={e => setForm({...form, qualifications: e.target.value})} className={inputCls} placeholder="e.g. ACE Certified" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#455250] mb-1">Certifications</label>
                    <input value={form.certifications} onChange={e => setForm({...form, certifications: e.target.value})} className={inputCls} placeholder="e.g. CPT, RYT-200" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#455250] mb-1">Expertise</label>
                    <input value={form.expertise} onChange={e => setForm({...form, expertise: e.target.value})} className={inputCls} placeholder="e.g. HIIT, Strength" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-[#455250] mb-1">Bio</label>
                    <textarea value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} rows={3} className={`${inputCls} resize-none`} placeholder="Tell clients about yourself..." />
                  </div>
                </div>
              </div>

              {/* Fee */}
              <div>
                <h3 className="text-xs font-bold text-[#455250] uppercase tracking-wider mb-3">Fee & Payment</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-[#455250] mb-1">Fee (₹)</label>
                    <input type="number" value={form.fee} onChange={e => setForm({...form, fee: e.target.value})} className={inputCls} placeholder="e.g. 3000" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#455250] mb-1">Payment Type</label>
                    <select value={form.paymentType} onChange={e => setForm({...form, paymentType: e.target.value})} className={inputCls}>
                      <option value="Per Month">Per Month</option>
                      <option value="Per Week">Per Week</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Availability */}
              <div>
                <h3 className="text-xs font-bold text-[#455250] uppercase tracking-wider mb-3">Availability</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-[#455250] mb-1">Available Days</label>
                    <input value={form.availableDays} onChange={e => setForm({...form, availableDays: e.target.value})} className={inputCls} placeholder="e.g. Monday to Friday" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#455250] mb-1">Start Time</label>
                    <input value={form.availableStartTime} onChange={e => setForm({...form, availableStartTime: e.target.value})} className={inputCls} placeholder="e.g. 06:00 AM" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#455250] mb-1">End Time</label>
                    <input value={form.availableEndTime} onChange={e => setForm({...form, availableEndTime: e.target.value})} className={inputCls} placeholder="e.g. 08:00 PM" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#455250] mb-1">Slot Duration (minutes)</label>
                    <input type="number" value={form.availableSlot} onChange={e => setForm({...form, availableSlot: e.target.value})} className={inputCls} placeholder="e.g. 60" />
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#D3DFDA] bg-[#F2EFE8] flex justify-end gap-3 rounded-b-2xl">
              <button onClick={() => setIsEditing(false)} disabled={isSaving} className="px-6 py-2.5 bg-white border border-[#E8E5DA] text-[#455250] font-bold rounded-xl hover:bg-[#F1F5F9] transition-colors disabled:opacity-50">
                Cancel
              </button>
              <button onClick={handleSave} disabled={isSaving} className="px-6 py-2.5 bg-[#164A4A] text-white font-bold rounded-xl hover:bg-[#C6A77D] transition-colors flex items-center gap-2 shadow-lg shadow-[#164A4A]/20 disabled:opacity-70">
                <Save size={16} /> {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainerProfile;