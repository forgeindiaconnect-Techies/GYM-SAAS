import React, { useState } from 'react';
import { X, ChevronRight, ChevronLeft, Save, User, Activity, CheckCircle } from 'lucide-react';

interface Props {
  onClose: () => void;
  onSubmit: (data: any) => void;
  plans: any[];
}

export const RegisterNewMemberModal: React.FC<Props> = ({ onClose, onSubmit, plans }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    gender: 'Male',
    dob: '',
    plan: plans.length > 0 ? plans[0].name : 'Basic',
    duration: '1 Month',
    startDate: new Date().toISOString().split('T')[0],
    assignedTrainer: '',
    status: 'Active',
    height: '',
    weight: '',
    fitnessGoal: 'General Fitness',
    fitnessLevel: 'Beginner',
    emergencyName: '',
    emergencyPhone: '',
    emergencyRelation: '',
    createLogin: true,
    sendEmail: true
  });

  const nextStep = () => setStep(s => Math.min(s + 1, 5));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 5) {
      nextStep();
      return;
    }
    
    // Auto calculate end date based on duration (simplified)
    const start = new Date(formData.startDate);
    const months = formData.duration === '1 Month' ? 1 : formData.duration === '3 Months' ? 3 : formData.duration === '6 Months' ? 6 : 12;
    const end = new Date(start.setMonth(start.getMonth() + months));
    
    onSubmit({ 
      ...formData, 
      customerType: 'NEW_CUSTOMER',
      endDate: end.toISOString().split('T')[0]
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#FFFFFF] rounded-2xl max-w-3xl w-full shadow-2xl border border-[#CCFBF1] overflow-hidden my-8 shrink-0">
        
        <div className="p-6 border-b border-[#CCFBF1] flex justify-between items-center bg-[#F8FAFC]">
          <div>
            <h2 className="text-xl font-bold text-[#1E293B]">Register New Customer</h2>
            <p className="text-sm text-[#475569] mt-1">Step {step} of 5</p>
          </div>
          <button onClick={onClose} type="button" className="text-[#475569] hover:text-[#1E293B] transition-colors p-2 rounded-lg hover:bg-gray-100">
            <X size={24} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 h-1.5">
          <div className="bg-[#16A34A] h-1.5 transition-all duration-300" style={{ width: `${(step / 5) * 100}%` }}></div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex items-center space-x-3 text-[#16A34A] mb-2 border-b border-[#CCFBF1] pb-2">
                <User size={20} />
                <h3 className="text-lg font-bold uppercase tracking-wider">Step 1: Personal Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-[#475569] mb-1">Full Name *</label>
                  <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-[#F8FAFC] border border-[#CCFBF1] rounded-xl px-4 py-2.5 outline-none focus:border-[#16A34A] focus:bg-[#FFFFFF]" placeholder="e.g. John Doe" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#475569] mb-1">Email Address *</label>
                  <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-[#F8FAFC] border border-[#CCFBF1] rounded-xl px-4 py-2.5 outline-none focus:border-[#16A34A] focus:bg-[#FFFFFF] invalid:[&:not(:placeholder-shown):not(:focus)]:border-red-500" placeholder="john@example.com" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#475569] mb-1">Phone Number *</label>
                  <input required type="tel" value={formData.phone} onChange={e => {
                    const val = e.target.value.replace(/\D/g, '');
                    if (val.length <= 10) setFormData({...formData, phone: val});
                  }} minLength={10} maxLength={10} pattern="\d{10}" title="Please enter exactly 10 digits" className="w-full bg-[#F8FAFC] border border-[#CCFBF1] rounded-xl px-4 py-2.5 outline-none focus:border-[#16A34A] focus:bg-[#FFFFFF] invalid:[&:not(:placeholder-shown):not(:focus)]:border-red-500" placeholder="10-digit number" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#475569] mb-1">Gender</label>
                  <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} className="w-full bg-[#F8FAFC] border border-[#CCFBF1] rounded-xl px-4 py-2.5 outline-none focus:border-[#16A34A] focus:bg-[#FFFFFF]">
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#475569] mb-1">Date of Birth</label>
                  <input type="date" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} className="w-full bg-[#F8FAFC] border border-[#CCFBF1] rounded-xl px-4 py-2.5 outline-none focus:border-[#16A34A] focus:bg-[#FFFFFF]" />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex items-center space-x-3 text-[#16A34A] mb-2 border-b border-[#CCFBF1] pb-2">
                <CheckCircle size={20} />
                <h3 className="text-lg font-bold uppercase tracking-wider">Step 2: Membership</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-[#475569] mb-1">Membership Plan *</label>
                  <select required value={formData.plan} onChange={e => setFormData({...formData, plan: e.target.value})} className="w-full bg-[#F8FAFC] border border-[#CCFBF1] rounded-xl px-4 py-2.5 outline-none focus:border-[#16A34A] focus:bg-[#FFFFFF]">
                    {plans.map(p => (
                      <option key={p.id || p.name} value={p.name}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#475569] mb-1">Status</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full bg-[#F8FAFC] border border-[#CCFBF1] rounded-xl px-4 py-2.5 outline-none focus:border-[#16A34A] focus:bg-[#FFFFFF]">
                    <option value="Active">Active</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#475569] mb-1">Membership Start Date *</label>
                  <input required type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} className="w-full bg-[#F8FAFC] border border-[#CCFBF1] rounded-xl px-4 py-2.5 outline-none focus:border-[#16A34A] focus:bg-[#FFFFFF]" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#475569] mb-1">Duration</label>
                  <select value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} className="w-full bg-[#F8FAFC] border border-[#CCFBF1] rounded-xl px-4 py-2.5 outline-none focus:border-[#16A34A] focus:bg-[#FFFFFF]">
                    <option value="1 Month">1 Month</option>
                    <option value="3 Months">3 Months</option>
                    <option value="6 Months">6 Months</option>
                    <option value="1 Year">1 Year</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-[#475569] mb-1">Assigned Trainer (Optional)</label>
                  <select value={formData.assignedTrainer} onChange={e => setFormData({...formData, assignedTrainer: e.target.value})} className="w-full bg-[#F8FAFC] border border-[#CCFBF1] rounded-xl px-4 py-2.5 outline-none focus:border-[#16A34A] focus:bg-[#FFFFFF]">
                    <option value="">No Trainer Assigned</option>
                    <option value="trainer1">Mike Johnson</option>
                    <option value="trainer2">Sarah Williams</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex items-center space-x-3 text-[#16A34A] mb-2 border-b border-[#CCFBF1] pb-2">
                <Activity size={20} />
                <h3 className="text-lg font-bold uppercase tracking-wider">Step 3: Fitness Information</h3>
              </div>
              <p className="text-sm text-[#475569] mb-4">Provide basic metrics to initialize their AI Assessment.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-[#475569] mb-1">Height (cm)</label>
                  <input type="number" value={formData.height} onChange={e => setFormData({...formData, height: e.target.value})} className="w-full bg-[#F8FAFC] border border-[#CCFBF1] rounded-xl px-4 py-2.5 outline-none focus:border-[#16A34A] focus:bg-[#FFFFFF]" placeholder="e.g. 175" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#475569] mb-1">Current Weight (kg)</label>
                  <input type="number" value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})} className="w-full bg-[#F8FAFC] border border-[#CCFBF1] rounded-xl px-4 py-2.5 outline-none focus:border-[#16A34A] focus:bg-[#FFFFFF]" placeholder="e.g. 70" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#475569] mb-1">Fitness Goal</label>
                  <select value={formData.fitnessGoal} onChange={e => setFormData({...formData, fitnessGoal: e.target.value})} className="w-full bg-[#F8FAFC] border border-[#CCFBF1] rounded-xl px-4 py-2.5 outline-none focus:border-[#16A34A] focus:bg-[#FFFFFF]">
                    <option value="Weight Loss">Weight Loss</option>
                    <option value="Weight Gain">Weight Gain</option>
                    <option value="Muscle Building">Muscle Building</option>
                    <option value="General Fitness">General Fitness</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#475569] mb-1">Fitness Level</label>
                  <select value={formData.fitnessLevel} onChange={e => setFormData({...formData, fitnessLevel: e.target.value})} className="w-full bg-[#F8FAFC] border border-[#CCFBF1] rounded-xl px-4 py-2.5 outline-none focus:border-[#16A34A] focus:bg-[#FFFFFF]">
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex items-center space-x-3 text-[#16A34A] mb-2 border-b border-[#CCFBF1] pb-2">
                <User size={20} />
                <h3 className="text-lg font-bold uppercase tracking-wider">Step 4: Emergency Contact</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-[#475569] mb-1">Contact Name</label>
                  <input value={formData.emergencyName} onChange={e => setFormData({...formData, emergencyName: e.target.value})} className="w-full bg-[#F8FAFC] border border-[#CCFBF1] rounded-xl px-4 py-2.5 outline-none focus:border-[#16A34A] focus:bg-[#FFFFFF]" placeholder="Emergency Contact Name" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#475569] mb-1">Contact Phone</label>
                  <input type="tel" value={formData.emergencyPhone} onChange={e => {
                    const val = e.target.value.replace(/\D/g, '');
                    if (val.length <= 10) setFormData({...formData, emergencyPhone: val});
                  }} minLength={10} maxLength={10} pattern="\d{10}" title="Please enter exactly 10 digits" className="w-full bg-[#F8FAFC] border border-[#CCFBF1] rounded-xl px-4 py-2.5 outline-none focus:border-[#16A34A] focus:bg-[#FFFFFF] invalid:[&:not(:placeholder-shown):not(:focus)]:border-red-500" placeholder="Phone Number" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#475569] mb-1">Relationship</label>
                  <input value={formData.emergencyRelation} onChange={e => setFormData({...formData, emergencyRelation: e.target.value})} className="w-full bg-[#F8FAFC] border border-[#CCFBF1] rounded-xl px-4 py-2.5 outline-none focus:border-[#16A34A] focus:bg-[#FFFFFF]" placeholder="e.g. Parent" />
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex items-center space-x-3 text-[#16A34A] mb-2 border-b border-[#CCFBF1] pb-2">
                <CheckCircle size={20} />
                <h3 className="text-lg font-bold uppercase tracking-wider">Step 5: Account Creation</h3>
              </div>
              <div className="bg-[#F0FDFA] p-6 rounded-xl border border-[#CCFBF1]">
                <p className="text-[#1E293B] font-medium mb-4">By completing this registration, a secure member account will be automatically generated and linked to this gym.</p>
                <div className="flex flex-col space-y-4">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input type="checkbox" checked={formData.createLogin} onChange={e => setFormData({...formData, createLogin: e.target.checked})} className="w-5 h-5 text-[#16A34A] rounded focus:ring-[#16A34A]" />
                    <span className="text-[#1E293B] font-medium">Create Member Login Account Now</span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input type="checkbox" checked={formData.sendEmail} onChange={e => setFormData({...formData, sendEmail: e.target.checked})} className="w-5 h-5 text-[#16A34A] rounded focus:ring-[#16A34A]" />
                    <span className="text-[#1E293B] font-medium">Send Welcome Email & Setup Instructions</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="flex justify-between items-center pt-6 border-t border-[#CCFBF1]">
            <button 
              type="button" 
              onClick={step === 1 ? onClose : prevStep} 
              className="px-6 py-2.5 text-[#475569] font-bold hover:bg-gray-100 rounded-xl transition-colors flex items-center"
            >
              {step === 1 ? 'Cancel' : <><ChevronLeft size={18} className="mr-1" /> Back</>}
            </button>
            <button 
              type="submit" 
              className="px-8 py-2.5 bg-[#16A34A] text-white rounded-xl font-bold hover:bg-[#15803D] transition-colors shadow-lg shadow-[#16A34A]/20 flex items-center gap-2"
            >
              {step < 5 ? <>Next Step <ChevronRight size={18} /></> : <><Save size={18} /> Complete Registration</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
