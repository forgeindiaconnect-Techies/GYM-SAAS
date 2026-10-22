import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Send, Loader2, User, Clock, Copy, Check, ExternalLink, Mail } from 'lucide-react';
import { addItem } from '../../utils/mockDb';
import api from '../../utils/api';

const INITIAL_DATA = {
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
  const [generatedLink, setGeneratedLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [emailDeliveryStatus, setEmailDeliveryStatus] = useState<string | null>(null);

  const validate = () => {
    const newErrors: any = {};
    if (!formData.ownerName.trim()) newErrors.ownerName = 'Owner name is required';
    if (!formData.ownerEmail.trim()) newErrors.ownerEmail = 'Owner email is required';
    else if (!/^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,6}$/.test(formData.ownerEmail.trim())) {
      newErrors.ownerEmail = 'Invalid email format';
    }
    if (!formData.ownerPhone.trim()) newErrors.ownerPhone = 'Phone is required';
    else if (!/^\d{10}$/.test(formData.ownerPhone.trim())) newErrors.ownerPhone = 'Phone must be 10 digits';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    setIsSubmitting(true);
    setEmailDeliveryStatus(null);
    try {
      const inviteId = Date.now().toString();
      const expiryDays = formData.linkExpiry === 'Never' ? null : (parseInt(formData.linkExpiry, 10) || 7);
      const expiresAtMs = expiryDays ? Date.now() + expiryDays * 24 * 60 * 60 * 1000 : null;
      const expiresAtIso = expiresAtMs ? new Date(expiresAtMs).toISOString() : null;

      const inviteLink = `${window.location.origin}/register/gym-owner?email=${encodeURIComponent(formData.ownerEmail.trim())}&name=${encodeURIComponent(formData.ownerName.trim())}&phone=${encodeURIComponent(formData.ownerPhone.trim())}&invite=${inviteId}${expiresAtMs ? `&expiresAt=${expiresAtMs}` : ''}&expiry=${encodeURIComponent(formData.linkExpiry)}`;
      setGeneratedLink(inviteLink);

      // Trigger backend email dispatch via Brevo
      try {
        const res = await api.post('/auth/send-gym-invitation', {
          ownerName: formData.ownerName.trim(),
          ownerEmail: formData.ownerEmail.trim(),
          ownerPhone: formData.ownerPhone.trim(),
          linkExpiry: formData.linkExpiry,
          inviteLink
        });
        if (res.data?.emailSent) {
          setEmailDeliveryStatus(`Invitation email successfully delivered to ${formData.ownerEmail.trim()} via Brevo.`);
        } else {
          setEmailDeliveryStatus(`Notice: ${res.data?.error || res.data?.message || 'Email delivery could not be completed'}. You can copy and share the link below directly.`);
        }
      } catch (apiErr: any) {
        console.warn('Backend email API warning:', apiErr);
        setEmailDeliveryStatus(`Notice: ${apiErr.response?.data?.message || apiErr.message || 'Email service error'}. You can copy and share the link below directly.`);
      }

      // Save invitation in mock DB for dashboard listing
      addItem('gymInvitations', {
        id: inviteId,
        gymName: 'Pending Registration',
        type: 'Gym Owner',
        owner: formData.ownerName.trim(),
        email: formData.ownerEmail.trim(),
        phone: formData.ownerPhone.trim(),
        date: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
        expiresAt: expiresAtIso,
        status: 'Sent',
        expiry: formData.linkExpiry,
        link: inviteLink
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
        <div className="bg-[#FFFFFF] border border-[#D9E2E3] rounded-2xl p-8 md:p-12 text-center shadow-lg">
          <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} className="text-green-500" />
          </div>
          <h1 className="text-3xl font-bold text-[#344B4A] mb-3">Invitation Sent!</h1>
          <p className="text-[#697778] text-base mb-6 max-w-lg mx-auto">
            An invitation link has been generated and dispatched to <span className="text-[#344B4A] font-semibold">{formData.ownerEmail}</span>. 
            The gym owner can use this link to complete their full gym registration process.
          </p>

          {emailDeliveryStatus && (
            <div className="max-w-md mx-auto mb-6 p-3 bg-orange-50 border border-orange-200 rounded-xl text-xs text-[#116660] font-medium flex items-center justify-center gap-2">
              <Mail size={15} className="shrink-0" />
              <span>{emailDeliveryStatus}</span>
            </div>
          )}

          {/* Invitation Details */}
          <div className="bg-[#FFFFFF] border border-[#D9E2E3] rounded-xl p-5 text-left max-w-md mx-auto mb-6 shadow-sm">
            <h3 className="text-[#344B4A] font-bold text-sm mb-3 border-b border-[#D9E2E3] pb-2">Invitation Details</h3>
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-[#697778]">Owner:</span>
                <span className="text-[#344B4A] font-semibold">{formData.ownerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#697778]">Email Address:</span>
                <span className="text-[#344B4A] font-semibold">{formData.ownerEmail}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#697778]">Phone Number:</span>
                <span className="text-[#344B4A] font-semibold">{formData.ownerPhone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#697778]">Link Expiry:</span>
                <span className="text-[#344B4A] font-semibold">{formData.linkExpiry}</span>
              </div>
            </div>
          </div>

          {/* Direct Registration Link Card */}
          <div className="bg-[#E8EFF0] border border-orange-200 rounded-2xl p-4 text-left max-w-md mx-auto mb-8 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#344B4A]">Registration Link for Gym Owner</span>
              {copied && (
                <span className="text-xs font-bold text-green-600 flex items-center gap-1">
                  <Check size={12} /> Copied!
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={generatedLink}
                className="flex-1 bg-white border border-[#D9E2E3] text-[#344B4A] rounded-lg px-3 py-2 text-xs outline-none select-all font-mono"
              />
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(generatedLink);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="px-3.5 py-2 bg-[#167D78] text-white hover:bg-[#116660] rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shrink-0 shadow-sm"
              >
                <Copy size={13} />
                <span>Copy</span>
              </button>
              <a
                href={generatedLink}
                target="_blank"
                rel="noreferrer"
                className="p-2 bg-white border border-[#D9E2E3] hover:bg-stone-50 text-[#344B4A] rounded-lg text-xs flex items-center justify-center transition-colors shrink-0"
                title="Open registration link"
              >
                <ExternalLink size={14} />
              </a>
            </div>
            <p className="text-[11px] text-[#697778] mt-2">
              The gym owner will enter their gym name, type, and details directly through this onboarding link.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button 
              onClick={() => {
                setFormData(INITIAL_DATA);
                setIsSuccess(false);
                setGeneratedLink('');
                setEmailDeliveryStatus(null);
              }}
              className="px-6 py-3 bg-[#FFFFFF] border border-[#D9E2E3] text-[#344B4A] rounded-xl font-bold hover:bg-[#E8EFF0] transition-colors text-sm"
            >
              Send Another Invite
            </button>
            <Link 
              to="/super-admin/dashboard"
              className="px-6 py-3 bg-[#167D78] text-white rounded-xl font-bold hover:bg-[#116660] transition-colors shadow-lg shadow-[#167D78]/20 text-sm"
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
        <Link to="/super-admin/dashboard" className="p-2 bg-[#FFFFFF] hover:bg-[#D8EAE7] rounded-xl transition-colors">
          <ArrowLeft size={20} className="text-[#344B4A]" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#344B4A]">Add Gym Manually</h1>
          <p className="text-[#697778] text-sm mt-1">Send an invitation to a gym owner to complete their gym onboarding.</p>
        </div>
      </div>

      <div className="bg-[#FFFFFF] border border-[#D9E2E3] rounded-2xl p-6 md:p-8 shadow-sm">
        <form onSubmit={handleSendInvitation} className="space-y-8">
          
          {/* Owner Details Section */}
          <div>
            <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-[#D9E2E3]">
              <div className="w-10 h-10 bg-[#167D78]/10 rounded-xl flex items-center justify-center">
                <User className="text-[#167D78]" size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#344B4A]">Owner Information</h2>
                <p className="text-xs text-[#697778]">The gym owner will configure their gym name, type, and facilities during registration.</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[#697778] mb-2">Owner Full Name *</label>
                <input
                  type="text"
                  value={formData.ownerName}
                  onChange={(e) => { setFormData({ ...formData, ownerName: e.target.value }); setErrors({ ...errors, ownerName: '' }); }}
                  placeholder="e.g. John Doe"
                  className={`w-full bg-[#FFFFFF] border ${errors.ownerName ? 'border-red-400' : 'border-[#D9E2E3]'} text-[#344B4A] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#167D78] transition-colors`}
                />
                {errors.ownerName && <p className="text-red-500 text-xs mt-1">{errors.ownerName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#697778] mb-2">Email Address *</label>
                <input
                  type="email"
                  value={formData.ownerEmail}
                  onChange={(e) => { setFormData({ ...formData, ownerEmail: e.target.value }); setErrors({ ...errors, ownerEmail: '' }); }}
                  placeholder="john@example.com"
                  className={`w-full bg-[#FFFFFF] border ${errors.ownerEmail ? 'border-red-400' : 'border-[#D9E2E3]'} text-[#344B4A] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#167D78] transition-colors`}
                />
                {errors.ownerEmail && <p className="text-red-500 text-xs mt-1">{errors.ownerEmail}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#697778] mb-2">Phone Number *</label>
                <input
                  type="tel"
                  value={formData.ownerPhone}
                  onChange={(e) => { setFormData({ ...formData, ownerPhone: e.target.value }); setErrors({ ...errors, ownerPhone: '' }); }}
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  className={`w-full bg-[#FFFFFF] border ${errors.ownerPhone ? 'border-red-400' : 'border-[#D9E2E3]'} text-[#344B4A] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#167D78] transition-colors`}
                />
                {errors.ownerPhone && <p className="text-red-500 text-xs mt-1">{errors.ownerPhone}</p>}
              </div>
            </div>
          </div>

          {/* Invitation Settings Section */}
          <div>
            <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-[#D9E2E3]">
              <div className="w-10 h-10 bg-[#167D78]/10 rounded-xl flex items-center justify-center">
                <Clock className="text-[#167D78]" size={20} />
              </div>
              <h2 className="text-lg font-bold text-[#344B4A]">Invitation Settings</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[#697778] mb-2">Link Expiry Duration</label>
                <div className="relative">
                  <select
                    value={formData.linkExpiry}
                    onChange={(e) => setFormData({ ...formData, linkExpiry: e.target.value })}
                    className="w-full bg-[#FFFFFF] border border-[#D9E2E3] text-[#344B4A] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#167D78] transition-colors appearance-none"
                  >
                    <option value="1 Day">1 Day</option>
                    <option value="3 Days">3 Days</option>
                    <option value="7 Days">7 Days</option>
                    <option value="14 Days">14 Days</option>
                    <option value="30 Days">30 Days</option>
                    <option value="Never">Never Expires</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#697778]">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                  </div>
                </div>
                <p className="text-[#697778] text-xs mt-2">The gym owner must complete registration before this link expires.</p>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-[#D9E2E3] flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center space-x-2 px-8 py-3.5 bg-[#167D78] text-white rounded-xl font-bold hover:bg-[#116660] transition-all shadow-lg shadow-[#167D78]/20 disabled:opacity-60"
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
