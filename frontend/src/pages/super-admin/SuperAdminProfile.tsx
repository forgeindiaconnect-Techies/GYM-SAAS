import { useState, useEffect } from 'react';
import { Save, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';

const SuperAdminProfile = () => {
  const { user, updateUser } = useAuth();
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
    }
  }, [user]);

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

  const inputCls = "w-full bg-[#FFFFFF] border border-[#D3DFDA] rounded-xl px-4 py-3 text-[#202828] outline-none focus:border-[#6fa3a0] transition-colors";

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#202828] tracking-tight">Super Admin Profile</h1>
        <p className="text-[#455250] mt-1">Manage your administrative account details.</p>
      </div>

      <div className="bg-[#FFFFFF] border border-[#D3DFDA] rounded-2xl p-6 md:p-8 flex items-center space-x-6">
        <div className="w-24 h-24 bg-[#FFFFFF] border-2 border-[#6fa3a0] rounded-full flex items-center justify-center text-[#6fa3a0] text-3xl font-bold relative overflow-hidden group">
          <span>{form.firstName?.[0] || 'S'}</span>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-[#202828]">{form.firstName} {form.lastName}</h2>
          <p className="text-[#6fa3a0] font-semibold">{user?.role || 'SUPER ADMIN'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-[#FFFFFF] border border-[#D3DFDA] rounded-2xl p-6 md:p-8 space-y-6">
        <h2 className="text-xl font-bold text-[#202828] mb-4 border-b border-[#D3DFDA] pb-2">Personal Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm text-[#455250] mb-2">First Name</label>
            <input required value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} className={inputCls} />
          </div>
          <div>
            <label className="block text-sm text-[#455250] mb-2">Last Name</label>
            <input required value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} className={inputCls} />
          </div>
          <div>
            <label className="block text-sm text-[#455250] mb-2">Email Address</label>
            <input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} className={inputCls} />
          </div>
          <div>
            <label className="block text-sm text-[#455250] mb-2">Phone Number</label>
            <input required value={form.phone} onChange={e => setForm({...form, phone: e.target.value.replace(/\D/g, '').slice(0, 10)})} className={inputCls} placeholder="10 digit number" />
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button 
            type="submit" 
            disabled={isSaving}
            className="px-6 py-3 bg-[#6fa3a0] text-[#202828] font-bold rounded-xl hover:bg-teal-600 flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default SuperAdminProfile;
