import React, { useState, useEffect } from 'react';
import { X, Loader2, Building2, MapPin } from 'lucide-react';
import api from '../utils/api';

interface CustomerEnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  gymId: string;
  gymName: string;
}

export const CustomerEnquiryModal = ({ isOpen, onClose, gymId, gymName }: CustomerEnquiryModalProps) => {
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingBranches, setFetchingBranches] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    customerName: '',
    mobileNumber: '',
    email: '',
    address: '',
    city: '',
    branchId: '',
    enquiryType: 'Membership',
    message: '',
    preferredContactMethod: 'Phone Call',
  });

  useEffect(() => {
    if (isOpen && gymId) {
      setSubmitted(false);
      setFetchingBranches(true);
      // Fetch gym and branches details via the public endpoint
      api.get(`/gyms/public/${gymId}`)
        .then(res => {
           const fetchedBranches = res.data.branches || [];
           setBranches(fetchedBranches);
           if (fetchedBranches.length === 1) {
             setFormData(prev => ({ ...prev, branchId: fetchedBranches[0]._id }));
           }
        })
        .catch(err => console.error('Failed to fetch gym public details:', err))
        .finally(() => setFetchingBranches(false));
    }
  }, [isOpen, gymId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerName || !formData.mobileNumber || !formData.email || !formData.message) {
      alert('Please fill out all required fields.');
      return;
    }
    if (branches.length > 0 && !formData.branchId) {
      alert('Please select a branch.');
      return;
    }

    setLoading(true);
    try {
      const payload = { ...formData, gymId };
      if (!payload.branchId) {
        delete (payload as any).branchId;
      }
      
      await api.post('/enquiries', payload);
      setSubmitted(true);
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to submit enquiry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center relative shadow-2xl border border-[#D3DFDA] my-auto animate-in fade-in zoom-in-95 duration-150">
          <button onClick={onClose} className="absolute right-4 top-4 text-[#455250] hover:bg-[#F1F5F9] p-2 rounded-full transition-colors">
            <X size={20} />
          </button>
          <div className="w-16 h-16 bg-green-100 text-[#164A4A] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
          </div>
          <h2 className="text-2xl font-bold text-[#202828] mb-2">Enquiry Submitted</h2>
          <p className="text-[#455250] mb-6">Your enquiry has been submitted successfully. The {gymName} team will contact you soon.</p>
          <button onClick={onClose} className="w-full bg-[#164A4A] text-white py-3 rounded-xl font-bold hover:bg-[#164A4A]/90 transition-colors shadow-sm">
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl border border-[#D3DFDA] overflow-hidden my-auto max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Pinned Modal Header */}
        <div className="p-5 sm:p-6 border-b border-[#D3DFDA] flex justify-between items-center bg-[#F8F9F8] shrink-0">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#202828]">Enquire Now</h2>
            <p className="text-[#455250] text-xs sm:text-sm mt-0.5 flex items-center gap-1.5 font-medium">
              <Building2 size={15} className="text-[#164A4A]" /> {gymName}
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 text-[#455250] hover:text-[#202828] hover:bg-slate-200 rounded-lg transition-colors"
            title="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden min-h-0">
          <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1 custom-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#455250] uppercase tracking-wider">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.customerName}
                  onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                  className="w-full bg-[#F1F5F3] border border-[#D3DFDA] text-[#202828] rounded-xl px-4 py-2.5 outline-none focus:border-[#164A4A] focus:bg-white text-sm transition-all"
                  placeholder="John Doe"
                />
              </div>
              
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#455250] uppercase tracking-wider">Mobile Number *</label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  pattern="[0-9]{10}"
                  value={formData.mobileNumber}
                  onChange={e => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setFormData({ ...formData, mobileNumber: val });
                  }}
                  className="w-full bg-[#F1F5F3] border border-[#D3DFDA] text-[#202828] rounded-xl px-4 py-2.5 outline-none focus:border-[#164A4A] focus:bg-white text-sm transition-all"
                  placeholder="9876543210"
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-bold text-[#455250] uppercase tracking-wider">Email Address *</label>
                <input
                  type="email"
                  required
                  pattern="[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value.replace(/\s/g, '').toLowerCase() })}
                  className="w-full bg-[#F1F5F3] border border-[#D3DFDA] text-[#202828] rounded-xl px-4 py-2.5 outline-none focus:border-[#164A4A] focus:bg-white text-sm transition-all"
                  placeholder="john@example.com"
                  title="Please enter a valid email address"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#455250] uppercase tracking-wider">Enquiry Type *</label>
                <select
                  value={formData.enquiryType}
                  onChange={e => setFormData({ ...formData, enquiryType: e.target.value })}
                  className="w-full bg-[#F1F5F3] border border-[#D3DFDA] text-[#202828] rounded-xl px-4 py-2.5 outline-none focus:border-[#164A4A] focus:bg-white text-sm transition-all"
                >
                  <option value="Membership">Membership</option>
                  <option value="Pricing">Pricing</option>
                  <option value="Personal Training">Personal Training</option>
                  <option value="Gym Facilities">Gym Facilities</option>
                  <option value="Trial">Trial</option>
                  <option value="Timings">Timings</option>
                  <option value="Trainers">Trainers</option>
                  <option value="Equipment">Equipment</option>
                  <option value="Offers">Offers</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#455250] uppercase tracking-wider">Preferred Contact Method</label>
                <select
                  value={formData.preferredContactMethod}
                  onChange={e => setFormData({ ...formData, preferredContactMethod: e.target.value })}
                  className="w-full bg-[#F1F5F3] border border-[#D3DFDA] text-[#202828] rounded-xl px-4 py-2.5 outline-none focus:border-[#164A4A] focus:bg-white text-sm transition-all"
                >
                  <option value="Phone Call">Phone Call</option>
                  <option value="Email">Email</option>
                  <option value="WhatsApp">WhatsApp</option>
                </select>
              </div>
            </div>

            {branches.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#455250] uppercase tracking-wider">Select Branch *</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {branches.map(b => (
                    <label key={b._id} className={`flex items-start p-3 border rounded-xl cursor-pointer transition-colors ${formData.branchId === b._id ? 'border-[#164A4A] bg-[#164A4A]/5' : 'border-[#D3DFDA] bg-[#F1F5F3] hover:border-[#6fa3a0]'}`}>
                      <input
                        type="radio"
                        name="branch"
                        value={b._id}
                        checked={formData.branchId === b._id}
                        onChange={() => setFormData({ ...formData, branchId: b._id })}
                        className="mt-1 mr-3 text-[#164A4A] focus:ring-[#164A4A]"
                      />
                      <div>
                        <div className="font-semibold text-[#202828] text-sm">{b.name}</div>
                        <div className="text-xs text-[#687B78] flex items-center gap-1 mt-0.5"><MapPin size={11} /> {b.address?.area || b.address?.city}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#455250] uppercase tracking-wider">Message *</label>
              <textarea
                required
                rows={3}
                value={formData.message}
                onChange={e => setFormData({ ...formData, message: e.target.value })}
                className="w-full bg-[#F1F5F3] border border-[#D3DFDA] text-[#202828] rounded-xl px-4 py-2.5 outline-none focus:border-[#164A4A] focus:bg-white text-sm transition-all resize-none"
                placeholder="Tell us what you would like to know..."
              />
            </div>
          </div>

          {/* Pinned Modal Footer */}
          <div className="p-4 sm:p-5 flex gap-3 border-t border-[#D3DFDA] bg-[#F8F9F8] shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 bg-white border border-[#D3DFDA] text-[#455250] font-bold rounded-xl hover:bg-slate-100 transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || fetchingBranches}
              className="flex-1 py-2.5 px-4 bg-[#164A4A] text-white font-bold rounded-xl hover:bg-[#164A4A]/90 transition-colors flex items-center justify-center disabled:opacity-70 text-sm shadow-sm"
            >
              {loading ? <><Loader2 className="animate-spin mr-2" size={18} /> Submitting...</> : 'Submit Enquiry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
