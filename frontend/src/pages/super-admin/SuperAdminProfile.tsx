import { useState, useEffect, useRef } from 'react';
import { Save, Loader2, ShieldCheck, User, Mail, Phone, Sparkles, Key, CheckCircle2, ShieldAlert, Camera } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';

const SuperAdminProfile = () => {
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profilePhoto, setProfilePhoto] = useState<string>('');
  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || (user as any)?.mobile || '',
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || (user as any)?.mobile || '',
      });
      const saved = user.profilePhoto || localStorage.getItem(`admin_avatar_${user.id || 'admin'}`);
      if (saved) setProfilePhoto(saved);
    }
  }, [user]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, JPG, JPEG)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      setProfilePhoto(base64);
      const uid = user?.id || (user as any)?._id;
      if (uid) {
        localStorage.setItem(`admin_avatar_${uid}`, base64);
        try {
          await api.put(`/users/${uid}`, { profilePhoto: base64 });
        } catch (err) {
          console.warn('Could not persist avatar to server:', err);
        }
      }
      updateUser({ profilePhoto: base64 });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const userId = user?.id || (user as any)?._id;
    if (!userId) {
      alert('User session not found. Please log in again.');
      return;
    }

    setIsSaving(true);
    try {
      const res = await api.put(`/users/${userId}`, {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        mobile: form.phone.trim(),
        phone: form.phone.trim(),
      });

      const updated = res.data?.user || {};
      updateUser({
        firstName: updated.firstName || form.firstName.trim(),
        lastName: updated.lastName || form.lastName.trim(),
        email: updated.email || form.email.trim(),
        phone: updated.phone || updated.mobile || form.phone.trim(),
        mobile: updated.mobile || updated.phone || form.phone.trim(),
      });

      alert('Profile updated successfully!');
    } catch (err: any) {
      console.error('Failed to update profile:', err);
      alert(err.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const inputCls = "w-full bg-[#FFFFFF] border border-[#CBD5E1] rounded-xl px-4 py-3 text-[#111827] font-medium outline-none focus:border-[#EA580C] focus:ring-2 focus:ring-orange-500/20 transition-all placeholder:text-slate-400";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-orange-500/5 border border-orange-200/80 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#EA580C] to-[#FB923C] text-white flex items-center justify-center shadow-lg shadow-orange-500/25 shrink-0">
              <ShieldCheck size={28} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#FFF7ED] text-[#EA580C] border border-[#FFEDD5]">
                  Root Platform Account
                </span>
                <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Active
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">Super Admin Profile</h1>
              <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">Manage your central platform credentials and root governance profile.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Avatar & Role Card */}
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-6 relative overflow-hidden">
        {/* Avatar with Edit Photo Option */}
        <div className="relative group shrink-0">
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            className="hidden"
            onChange={handlePhotoUpload}
          />
          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-24 h-24 rounded-full bg-gradient-to-br from-[#EA580C] via-[#F97316] to-[#FB923C] ring-4 ring-orange-500/20 shadow-lg flex items-center justify-center text-white text-3xl font-black cursor-pointer overflow-hidden relative"
            title="Click to upload profile photo"
          >
            {profilePhoto ? (
              <img src={profilePhoto} alt="Admin Profile" className="w-full h-full object-cover" />
            ) : (
              <span>{form.firstName?.[0] || 'S'}</span>
            )}
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/45 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-bold">
              <Camera size={18} />
              <span>Edit</span>
            </div>
          </div>
          {/* Camera Edit Badge Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Upload new image"
            className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#EA580C] hover:bg-[#C2410C] active:bg-[#9A3412] text-white flex items-center justify-center shadow-md border-2 border-white transition-all cursor-pointer"
          >
            <Camera size={14} />
          </button>
        </div>
        <div className="flex-1 text-center sm:text-left space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-2xl font-black text-[#111827]">
                {form.firstName || 'Super'} {form.lastName || 'Admin'}
              </h2>
              <p className="text-sm font-semibold text-[#EA580C] flex items-center justify-center sm:justify-start gap-1 mt-0.5">
                <ShieldAlert size={14} /> {user?.role || 'SUPER_ADMIN'} • Platform Governance Lead
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2">
              <span className="px-3 py-1 bg-[#FFF7ED] text-[#C2410C] border border-[#FDBA74] rounded-full text-xs font-bold">
                Level 0 Access
              </span>
              <span className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-bold">
                Multi-Tenant
              </span>
            </div>
          </div>
          <p className="text-xs text-[#64748B] leading-relaxed max-w-xl">
            This account holds complete master authority across gym tenant approvals, billing subscriptions, staff permissions, and central system telemetry.
          </p>
        </div>
      </div>

      {/* Personal Information Form */}
      <form onSubmit={handleSubmit} className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm border-t-4 border-t-[#EA580C]">
        <div className="flex items-center gap-2.5 pb-4 border-b border-[#E2E8F0]">
          <div className="w-9 h-9 rounded-xl bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center border border-[#FFEDD5]">
            <User size={18} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#111827]">Personal Information</h2>
            <p className="text-xs text-[#64748B]">Update your administrative contact details</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#475569] mb-2 flex items-center gap-1.5">
              <User size={13} className="text-[#EA580C]" /> First Name
            </label>
            <input required value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} className={inputCls} placeholder="First Name" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#475569] mb-2 flex items-center gap-1.5">
              <User size={13} className="text-[#EA580C]" /> Last Name
            </label>
            <input required value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} className={inputCls} placeholder="Last Name" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#475569] mb-2 flex items-center gap-1.5">
              <Mail size={13} className="text-[#EA580C]" /> Email Address
            </label>
            <input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} className={inputCls} placeholder="admin@gymora.com" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#475569] mb-2 flex items-center gap-1.5">
              <Phone size={13} className="text-[#EA580C]" /> Phone Number
            </label>
            <input required value={form.phone} onChange={e => setForm({...form, phone: e.target.value.replace(/\D/g, '').slice(0, 10)})} className={inputCls} placeholder="10 digit number" />
          </div>
        </div>

        <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#E2E8F0]">
          <button 
            type="submit" 
            disabled={isSaving}
            className="px-6 py-3 bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold rounded-xl shadow-md shadow-orange-500/20 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            <span>{isSaving ? 'Saving Changes...' : 'Save Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default SuperAdminProfile;
