import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Send, Loader2, Building2, User, Clock } from 'lucide-react';
import { addItem } from '../../utils/mockDb';

const INITIAL_DATA = {
  gymName: '',
  gymType: 'Commercial Gym',
  ownerName: '',
  ownerEmail: '',
  ownerPhone: '',
  linkExpiry: '1 Day'
};

const SuperAdminAddGym = () => {

  const [formData, setFormData] = useState(INITIAL_DATA);
  const [errors, setErrors] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validate = () => {
    const newErrors: any = {};
    if (!formData.gymName) newErrors.gymName = 'Gym name is required';
    if (!formData.ownerName) newErrors.ownerName = 'Owner name is required';
    if (!formData.ownerEmail) newErrors.ownerEmail = 'Owner email is required';
    else if (!/^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,6}$/.test(formData.ownerEmail)) newErrors.ownerEmail = 'Invalid email format';
    if (!formData.ownerPhone) newErrors.ownerPhone = 'Phone is required';
    else if (!/^\d{10}$/.test(formData.ownerPhone)) newErrors.ownerPhone = 'Phone must be 10 digits';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    setIsSubmitting(true);
    try {
      // Simulate API call to send email/invitation
      await new Promise(resolve => setTimeout(resolve, 1500));

      const inviteId = Date.now().toString();

      // Save as an invitation in our mock DB
      addItem('gymInvitations', {
        id: inviteId,
        gymName: formData.gymName,
        type: formData.gymType,
        owner: formData.ownerName,
        email: formData.ownerEmail,
        phone: formData.ownerPhone,
        date: new Date().toISOString().split('T')[0],
        status: 'Sent',
        expiry: formData.linkExpiry
      });

      setIsSuccess(true);
      window.scrollTo(0, 0);
      
    } catch (err) {
      console.error(err);
      alert('Failed to send invitation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4">
        <div className="bg-[#FFFFFF] border border-[#D3DFDA] rounded-2xl p-8 md:p-12 text-center">
          <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} className="text-green-500" />
          </div>
          <h1 className="text-3xl font-bold text-[#202828] mb-4">Invitation Sent!</h1>
          <p className="text-[#455250] text-lg mb-8 max-w-lg mx-auto">
            An invitation link has been successfully sent to <span className="text-[#202828] font-semibold">{formData.ownerEmail}</span>. 
            The gym owner can use this link to complete their full registration process.
          </p>

          <div className="bg-[#FFFFFF] border border-[#D3DFDA] rounded-xl p-6 text-left max-w-sm mx-auto mb-10">
            <h3 className="text-[#202828] font-bold mb-4 border-b border-[#D3DFDA] pb-2">Invitation Details</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-[#455250]">Gym Name:</span>
                <span className="text-[#202828] font-medium">{formData.gymName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#455250]">Owner:</span>
                <span className="text-[#202828] font-medium">{formData.ownerName}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button 
              onClick={() => {
                setFormData(INITIAL_DATA);
                setIsSuccess(false);
              }}
              className="px-6 py-3 bg-[#FFFFFF] text-[#202828] rounded-xl font-bold hover:bg-[#E8E5DA] transition-colors"
            >
              Send Another Invite
            </button>
            <Link 
              to="/super-admin/dashboard"
              className="px-6 py-3 bg-[#164A4A] text-white rounded-xl font-bold hover:bg-[#C6A77D] transition-colors shadow-lg shadow-[#164A4A]/20"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link to="/super-admin/dashboard" className="p-2 bg-[#FFFFFF] hover:bg-[#E8E5DA] rounded-xl transition-colors">
          <ArrowLeft size={20} className="text-[#202828]" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#202828]">Add Gym Manually</h1>
          <p className="text-[#455250] text-sm mt-1">Send an invitation to a gym owner to complete their onboarding.</p>
        </div>
      </div>

      <div className="bg-[#FFFFFF] border border-[#D3DFDA] rounded-2xl p-6 md:p-8">
        <form onSubmit={handleSendInvitation} className="space-y-8">
          
          {/* Gym Details Section */}
          <div>
            <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-[#D3DFDA]">
              <div className="w-10 h-10 bg-[#164A4A]/10 rounded-xl flex items-center justify-center">
                <Building2 className="text-[#164A4A]" size={20} />
              </div>
              <h2 className="text-lg font-bold text-[#202828]">Gym Details</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[#455250] mb-2">Gym Name *</label>
                <input
                  type="text"
                  value={formData.gymName}
                  onChange={(e) => { setFormData({ ...formData, gymName: e.target.value }); setErrors({ ...errors, gymName: '' }); }}
                  placeholder="e.g. FitLife Arena"
                  className={`w-full bg-[#FFFFFF] border ${errors.gymName ? 'border-[#6fa3a0]' : 'border-[#D3DFDA]'} text-[#202828] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#164A4A] transition-colors`}
                />
                {errors.gymName && <p className="text-[#6fa3a0] text-xs mt-1">{errors.gymName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#455250] mb-2">Gym Type</label>
                <select
                  value={formData.gymType}
                  onChange={(e) => setFormData({ ...formData, gymType: e.target.value })}
                  className="w-full bg-[#FFFFFF] border border-[#D3DFDA] text-[#202828] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#164A4A] transition-colors appearance-none"
                >
                  <option>Commercial Gym</option>
                  <option>Boutique Studio</option>
                  <option>CrossFit Box</option>
                  <option>Yoga Studio</option>
                  <option>Martial Arts Academy</option>
                </select>
              </div>
            </div>
          </div>

          {/* Owner Details Section */}
          <div>
            <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-[#D3DFDA]">
              <div className="w-10 h-10 bg-[#164A4A]/10 rounded-xl flex items-center justify-center">
                <User className="text-[#164A4A]" size={20} />
              </div>
              <h2 className="text-lg font-bold text-[#202828]">Owner Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[#455250] mb-2">Owner Full Name *</label>
                <input
                  type="text"
                  value={formData.ownerName}
                  onChange={(e) => { setFormData({ ...formData, ownerName: e.target.value }); setErrors({ ...errors, ownerName: '' }); }}
                  placeholder="e.g. John Doe"
                  className={`w-full bg-[#FFFFFF] border ${errors.ownerName ? 'border-[#6fa3a0]' : 'border-[#D3DFDA]'} text-[#202828] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#164A4A] transition-colors`}
                />
                {errors.ownerName && <p className="text-[#6fa3a0] text-xs mt-1">{errors.ownerName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#455250] mb-2">Email Address *</label>
                <input
                  type="email"
                  value={formData.ownerEmail}
                  onChange={(e) => { setFormData({ ...formData, ownerEmail: e.target.value }); setErrors({ ...errors, ownerEmail: '' }); }}
                  placeholder="john@example.com"
                  className={`w-full bg-[#FFFFFF] border ${errors.ownerEmail ? 'border-[#6fa3a0]' : 'border-[#D3DFDA]'} text-[#202828] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#164A4A] transition-colors`}
                />
                {errors.ownerEmail && <p className="text-[#6fa3a0] text-xs mt-1">{errors.ownerEmail}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#455250] mb-2">Phone Number *</label>
                <input
                  type="tel"
                  value={formData.ownerPhone}
                  onChange={(e) => { setFormData({ ...formData, ownerPhone: e.target.value }); setErrors({ ...errors, ownerPhone: '' }); }}
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  className={`w-full bg-[#FFFFFF] border ${errors.ownerPhone ? 'border-[#6fa3a0]' : 'border-[#D3DFDA]'} text-[#202828] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#164A4A] transition-colors`}
                />
                {errors.ownerPhone && <p className="text-[#6fa3a0] text-xs mt-1">{errors.ownerPhone}</p>}
              </div>
            </div>
          </div>

          {/* Invitation Settings Section */}
          <div>
            <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-[#D3DFDA]">
              <div className="w-10 h-10 bg-[#164A4A]/10 rounded-xl flex items-center justify-center">
                <Clock className="text-[#164A4A]" size={20} />
              </div>
              <h2 className="text-lg font-bold text-[#202828]">Invitation Settings</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[#455250] mb-2">Link Expiry Duration</label>
                <div className="relative">
                  <select
                    value={formData.linkExpiry}
                    onChange={(e) => setFormData({ ...formData, linkExpiry: e.target.value })}
                    className="w-full bg-[#FFFFFF] border border-[#D3DFDA] text-[#202828] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#164A4A] transition-colors appearance-none"
                  >
                    <option value="1 Day">1 Day</option>
                    <option value="3 Days">3 Days</option>
                    <option value="7 Days">7 Days</option>
                    <option value="14 Days">14 Days</option>
                    <option value="30 Days">30 Days</option>
                    <option value="Never">Never Expires</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#455250]">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                  </div>
                </div>
                <p className="text-[#455250] text-xs mt-2">The gym owner must complete registration before this link expires.</p>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-[#D3DFDA] flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center space-x-2 px-8 py-3.5 bg-[#164A4A] text-white rounded-xl font-bold hover:bg-[#C6A77D] transition-all shadow-lg shadow-[#164A4A]/20 disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  <span>Sending Invite...</span>
                </>
              ) : (
                <>
                  <Send size={18} />
                  <span>Send Invitation Link</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SuperAdminAddGym;
