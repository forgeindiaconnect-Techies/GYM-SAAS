import React, { useState } from 'react';
import { X, Save, User, UserCheck } from 'lucide-react';

interface Props {
  onClose: () => void;
  onSubmit: (data: any) => void;
  plans: any[];
}

export const AddExistingMemberModal: React.FC<Props> = ({ onClose, onSubmit, plans }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    gender: 'Male',
    dob: '',
    plan: plans.length > 0 ? plans[0].name : 'Basic',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    assignedTrainer: '',
    status: 'Active',
    emergencyName: '',
    emergencyPhone: '',
    emergencyRelation: '',
    createLogin: true,
    sendEmail: true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...formData, customerType: 'EXISTING_CUSTOMER' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#FFFFFF] rounded-2xl max-w-3xl w-full shadow-2xl border border-[#DCD9CD] overflow-hidden my-8 shrink-0">
        <div className="p-6 border-b border-[#DCD9CD] flex justify-between items-center bg-[#F2EFE8]">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-[#34483F]/10 text-[#34483F] rounded-lg">
              <UserCheck size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#202522]">Add Existing Customer</h2>
              <p className="text-sm text-[#4A514D] mt-1">Import a member who is already part of your physical gym.</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#4A514D] hover:text-[#202522] transition-colors p-2 rounded-lg hover:bg-gray-100">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          
          {/* Personal Info */}
          <div>
            <h3 className="text-sm font-bold text-[#34483F] uppercase tracking-wider mb-4 border-b border-[#DCD9CD] pb-2">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-[#4A514D] mb-1">Full Name *</label>
                <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-[#F2EFE8] border border-[#DCD9CD] rounded-xl px-4 py-2.5 outline-none focus:border-[#34483F] focus:bg-[#FFFFFF]" placeholder="e.g. John Doe" />
              </div>
              <div>
                <label className="block text-sm font-bold text-[#4A514D] mb-1">Email Address *</label>
                <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-[#F2EFE8] border border-[#DCD9CD] rounded-xl px-4 py-2.5 outline-none focus:border-[#34483F] focus:bg-[#FFFFFF] invalid:[&:not(:placeholder-shown):not(:focus)]:border-red-500" placeholder="john@example.com" />
              </div>
              <div>
                <label className="block text-sm font-bold text-[#4A514D] mb-1">Phone Number *</label>
                <input required type="tel" value={formData.phone} onChange={e => {
                  const val = e.target.value.replace(/\D/g, '');
                  if (val.length <= 10) setFormData({...formData, phone: val});
                }} minLength={10} maxLength={10} pattern="\d{10}" title="Please enter exactly 10 digits" className="w-full bg-[#F2EFE8] border border-[#DCD9CD] rounded-xl px-4 py-2.5 outline-none focus:border-[#34483F] focus:bg-[#FFFFFF] invalid:[&:not(:placeholder-shown):not(:focus)]:border-red-500" placeholder="10-digit number" />
              </div>
              <div>
                <label className="block text-sm font-bold text-[#4A514D] mb-1">Gender</label>
                <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} className="w-full bg-[#F2EFE8] border border-[#DCD9CD] rounded-xl px-4 py-2.5 outline-none focus:border-[#34483F] focus:bg-[#FFFFFF]">
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-[#4A514D] mb-1">Date of Birth</label>
                <input type="date" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} className="w-full bg-[#F2EFE8] border border-[#DCD9CD] rounded-xl px-4 py-2.5 outline-none focus:border-[#34483F] focus:bg-[#FFFFFF]" />
              </div>
            </div>
          </div>

          {/* Membership Details */}
          <div>
            <h3 className="text-sm font-bold text-[#34483F] uppercase tracking-wider mb-4 border-b border-[#DCD9CD] pb-2">Membership Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-[#4A514D] mb-1">Membership Plan *</label>
                <select required value={formData.plan} onChange={e => setFormData({...formData, plan: e.target.value})} className="w-full bg-[#F2EFE8] border border-[#DCD9CD] rounded-xl px-4 py-2.5 outline-none focus:border-[#34483F] focus:bg-[#FFFFFF]">
                  {plans.map(p => (
                    <option key={p.id || p.name} value={p.name}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-[#4A514D] mb-1">Status</label>
                <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full bg-[#F2EFE8] border border-[#DCD9CD] rounded-xl px-4 py-2.5 outline-none focus:border-[#34483F] focus:bg-[#FFFFFF]">
                  <option value="Active">Active</option>
                  <option value="Pending">Pending</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-[#4A514D] mb-1">Membership Start Date *</label>
                <input required type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} className="w-full bg-[#F2EFE8] border border-[#DCD9CD] rounded-xl px-4 py-2.5 outline-none focus:border-[#34483F] focus:bg-[#FFFFFF]" />
              </div>
              <div>
                <label className="block text-sm font-bold text-[#4A514D] mb-1">Membership End Date (Optional)</label>
                <input type="date" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} className="w-full bg-[#F2EFE8] border border-[#DCD9CD] rounded-xl px-4 py-2.5 outline-none focus:border-[#34483F] focus:bg-[#FFFFFF]" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-[#4A514D] mb-1">Assigned Trainer (Optional)</label>
                <select value={formData.assignedTrainer} onChange={e => setFormData({...formData, assignedTrainer: e.target.value})} className="w-full bg-[#F2EFE8] border border-[#DCD9CD] rounded-xl px-4 py-2.5 outline-none focus:border-[#34483F] focus:bg-[#FFFFFF]">
                  <option value="">No Trainer Assigned</option>
                  <option value="trainer1">Mike Johnson</option>
                  <option value="trainer2">Sarah Williams</option>
                </select>
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div>
            <h3 className="text-sm font-bold text-[#34483F] uppercase tracking-wider mb-4 border-b border-[#DCD9CD] pb-2">Emergency Contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-bold text-[#4A514D] mb-1">Contact Name</label>
                <input value={formData.emergencyName} onChange={e => setFormData({...formData, emergencyName: e.target.value})} className="w-full bg-[#F2EFE8] border border-[#DCD9CD] rounded-xl px-4 py-2.5 outline-none focus:border-[#34483F] focus:bg-[#FFFFFF]" placeholder="Name" />
              </div>
              <div>
                <label className="block text-sm font-bold text-[#4A514D] mb-1">Contact Phone</label>
                <input type="tel" value={formData.emergencyPhone} onChange={e => {
                  const val = e.target.value.replace(/\D/g, '');
                  if (val.length <= 10) setFormData({...formData, emergencyPhone: val});
                }} minLength={10} maxLength={10} pattern="\d{10}" title="Please enter exactly 10 digits" className="w-full bg-[#F2EFE8] border border-[#DCD9CD] rounded-xl px-4 py-2.5 outline-none focus:border-[#34483F] focus:bg-[#FFFFFF] invalid:[&:not(:placeholder-shown):not(:focus)]:border-red-500" placeholder="10-digit number" />
              </div>
              <div>
                <label className="block text-sm font-bold text-[#4A514D] mb-1">Relationship</label>
                <input value={formData.emergencyRelation} onChange={e => setFormData({...formData, emergencyRelation: e.target.value})} className="w-full bg-[#F2EFE8] border border-[#DCD9CD] rounded-xl px-4 py-2.5 outline-none focus:border-[#34483F] focus:bg-[#FFFFFF]" placeholder="e.g. Spouse" />
              </div>
            </div>
          </div>

          {/* Account Setup */}
          <div>
            <h3 className="text-sm font-bold text-[#34483F] uppercase tracking-wider mb-4 border-b border-[#DCD9CD] pb-2">Account Setup</h3>
            <div className="flex flex-col space-y-3">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input type="checkbox" checked={formData.createLogin} onChange={e => setFormData({...formData, createLogin: e.target.checked})} className="w-5 h-5 text-[#34483F] rounded focus:ring-[#34483F]" />
                <span className="text-[#202522] font-medium">Create Member Login Account</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input type="checkbox" checked={formData.sendEmail} onChange={e => setFormData({...formData, sendEmail: e.target.checked})} className="w-5 h-5 text-[#34483F] rounded focus:ring-[#34483F]" />
                <span className="text-[#202522] font-medium">Send Welcome Email & Invitation</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-[#DCD9CD]">
            <button type="button" onClick={onClose} className="px-6 py-2.5 text-[#4A514D] font-bold hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
            <button type="submit" className="px-8 py-2.5 bg-[#34483F] text-white rounded-xl font-bold hover:bg-[#C6A77D] transition-colors shadow-lg shadow-[#34483F]/20 flex items-center gap-2">
              <Save size={18} /> Import Existing Member
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
