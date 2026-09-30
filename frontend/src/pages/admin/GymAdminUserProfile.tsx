import { useState, useEffect } from 'react';
import { Save, User, Shield, Key, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';

const GymAdminUserProfile = () => {
  const { user, updateUser } = useAuth();
  
  const [form, setForm] = useState({
    firstName: user?.firstName || 'Gym',
    lastName: user?.lastName || 'Admin',
    email: user?.email || 'admin@gym.com',
    phone: user?.phone || (user as any)?.mobile || '1234567890',
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        firstName: user.firstName || 'Gym',
        lastName: user.lastName || 'Admin',
        email: user.email || 'admin@gym.com',
        phone: user.phone || (user as any)?.mobile || '1234567890',
      });
    }
  }, [user]);

  const inputCls = "w-full bg-[#FFFFFF] border border-[#D3DFDA] rounded-xl px-4 py-3 text-[#202828] outline-none focus:border-[#164A4A] transition-colors";

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

      alert('Personal Profile Updated!');
    } catch (err: any) {
      console.error('Failed to update profile:', err);
      alert(err.response?.data?.message || 'Failed to update profile in database');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#202828] tracking-tight">Personal Profile</h1>
        <p className="text-[#455250] mt-1">Manage your personal admin account details and security.</p>
      </div>

      <div className="bg-[#FFFFFF] border border-[#D3DFDA] rounded-2xl p-6 md:p-8 flex items-center space-x-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#164A4A]/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        <div className="w-24 h-24 bg-[#FFFFFF] border-2 border-[#164A4A] rounded-full flex items-center justify-center text-[#164A4A] text-3xl font-bold relative overflow-hidden group shrink-0 z-10">
          <span>{form.firstName[0]}</span>
        </div>
        <div className="z-10">
          <h2 className="text-2xl font-bold text-[#202828]">{form.firstName} {form.lastName}</h2>
          <p className="text-[#164A4A] font-semibold flex items-center mt-1"><Shield size={16} className="mr-1"/> Gym Administrator</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-[#FFFFFF] border border-[#D3DFDA] rounded-2xl p-6 md:p-8 space-y-6">
        <div className="flex items-center space-x-2 text-[#202828] mb-6 border-b border-[#D3DFDA] pb-4">
          <User size={20} className="text-[#164A4A]"/>
          <h3 className="text-xl font-bold">Account Details</h3>
        </div>
        
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

        <div className="pt-6 mt-6 border-t border-[#D3DFDA] flex justify-end">
          <button 
            type="submit" 
            disabled={isSaving}
            className="px-6 py-3 bg-[#164A4A] text-[#202828] font-bold rounded-xl hover:bg-[#C6A77D] transition-colors flex items-center gap-2 shadow-lg shadow-[#164A4A]/20 disabled:opacity-50"
          >
            {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </form>

      {/* Security Section (Static/Mock) */}
      <div className="bg-[#FFFFFF] border border-[#D3DFDA] rounded-2xl p-6 md:p-8">
        <div className="flex items-center space-x-2 text-[#202828] mb-6 border-b border-[#D3DFDA] pb-4">
          <Key size={20} className="text-[#164A4A]"/>
          <h3 className="text-xl font-bold">Security & Password</h3>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="text-[#202828] font-semibold">Change Password</h4>
            <p className="text-[#455250] text-sm">We recommend updating your password every 90 days.</p>
          </div>
          <button className="px-4 py-2 bg-[#FFFFFF] border border-[#D3DFDA] text-[#202828] font-bold rounded-xl hover:bg-[#E8E5DA] transition-colors w-full md:w-auto">
            Update Password
          </button>
        </div>
      </div>
    </div>
  );
};

export default GymAdminUserProfile;
