import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, MapPin, Clock, ArrowLeft, Loader2, Dumbbell, Activity, CheckCircle, Wifi, Users, Droplets, Plus } from 'lucide-react';
import api from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';

const commonFacilities = [
  { id: 'changing_room', label: 'Changing Room', icon: Users },
  { id: 'shower', label: 'Shower', icon: Droplets },
  { id: 'locker', label: 'Locker', icon: CheckCircle },
  { id: 'parking', label: 'Parking', icon: MapPin },
  { id: 'wifi', label: 'Wi-Fi', icon: Wifi },
  { id: 'drinking_water', label: 'Drinking Water', icon: Droplets },
  { id: 'reception', label: 'Reception', icon: Building2 },
  { id: 'cardio_area', label: 'Cardio Area', icon: Activity },
  { id: 'strength_area', label: 'Strength Area', icon: Dumbbell },
];

const GymAdminAddBranch = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [planForm, setPlanForm] = useState({ name: '', price: '', duration: 'Monthly', features: '' });

  const [form, setForm] = useState({
    branchName: '',
    branchCode: '',
    phone: '',
    email: '',
    address: '',
    locality: '',
    city: '',
    state: '',
    pinCode: '',
    openingTime: '06:00 AM',
    closingTime: '10:00 PM',
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    trainingMode: 'offline',
    services: [] as string[],
    facilities: [] as string[],
    subscriptionPlans: [] as any[],
  });

  const handleAddPlan = (e: React.FormEvent) => {
    e.preventDefault();
    setForm(prev => ({ ...prev, subscriptionPlans: [...prev.subscriptionPlans, planForm] }));
    setShowPlanModal(false);
    setPlanForm({ name: '', price: '', duration: 'Monthly', features: '' });
  };

  const handleRemovePlan = (index: number) => {
    setForm(prev => {
      const plans = [...prev.subscriptionPlans];
      plans.splice(index, 1);
      return { ...prev, subscriptionPlans: plans };
    });
  };

  const handleDayToggle = (day: string) => {
    setForm(prev => {
      const days = [...prev.workingDays];
      if (days.includes(day)) {
        return { ...prev, workingDays: days.filter(d => d !== day) };
      } else {
        return { ...prev, workingDays: [...days, day] };
      }
    });
  };

  const handleFacilityToggle = (facility: string) => {
    setForm(prev => {
      const facs = [...prev.facilities];
      if (facs.includes(facility)) {
        return { ...prev, facilities: facs.filter(f => f !== facility) };
      } else {
        return { ...prev, facilities: [...facs, facility] };
      }
    });
  };

  const handleServiceToggle = (service: string) => {
    setForm(prev => {
      const srvs = [...prev.services];
      if (srvs.includes(service)) {
        return { ...prev, services: srvs.filter(s => s !== service) };
      } else {
        return { ...prev, services: [...srvs, service] };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validations
    if (!/^\d{10}$/.test(form.phone)) {
      setError('Phone number must be exactly 10 digits.');
      setLoading(false);
      return;
    }

    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError('Please enter a valid email address (e.g., branch@gym.com).');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        ...form,
        location: {
          address: form.address,
          area: form.locality,
          city: form.city,
          state: form.state,
          pinCode: form.pinCode,
        },
        operatingHours: {
          openingTime: form.openingTime,
          closingTime: form.closingTime,
          workingDays: form.workingDays
        }
      };

      const res = await api.post('/branches', payload);
      if (res.data.success) {
        navigate('/admin/branches');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create branch');
    } finally {
      setLoading(false);
    }
  };

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const allServices = ['Gym Membership', 'Personal Training', 'Group Classes', 'Online Training', 'AI Fitness Coaching', 'Diet Guidance'];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/admin/branches')} className="w-10 h-10 bg-white border border-[#D3DFDA] rounded-xl flex items-center justify-center text-[#455250] hover:bg-[#F1F5F3] hover:text-[#164A4A] transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-[#202828] tracking-tight">Add New Branch</h1>
          <p className="text-[#455250] mt-1">Add a new location under your gym.</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Section 1 - Basic Information */}
        <div className="bg-white border border-[#D3DFDA] rounded-2xl p-8">
          <h2 className="text-xl font-bold text-[#202828] mb-6 flex items-center gap-2 border-b border-[#D3DFDA] pb-4">
            <Building2 className="text-[#164A4A]" /> Basic Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-[#455250] mb-2">Branch Name *</label>
              <input required type="text" value={form.branchName} onChange={e => setForm({...form, branchName: e.target.value})} placeholder="e.g. Main Branch" className="w-full bg-[#F2EFE8] border border-[#D3DFDA] rounded-xl px-4 py-3 text-[#202828] outline-none focus:border-[#164A4A]" />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#455250] mb-2">Branch Code *</label>
              <input required type="text" value={form.branchCode} onChange={e => setForm({...form, branchCode: e.target.value.toUpperCase()})} placeholder="e.g. GYM-001" className="w-full bg-[#F2EFE8] border border-[#D3DFDA] rounded-xl px-4 py-3 text-[#202828] outline-none focus:border-[#164A4A]" />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#455250] mb-2">Branch Phone Number *</label>
              <input required type="tel" maxLength={10} value={form.phone} onChange={e => setForm({...form, phone: e.target.value.replace(/\D/g, '')})} placeholder="e.g. 9876543210" className="w-full bg-[#F2EFE8] border border-[#D3DFDA] rounded-xl px-4 py-3 text-[#202828] outline-none focus:border-[#164A4A]" />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#455250] mb-2">Branch Email</label>
              <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="e.g. branch@gym.com" className="w-full bg-[#F2EFE8] border border-[#D3DFDA] rounded-xl px-4 py-3 text-[#202828] outline-none focus:border-[#164A4A]" />
            </div>
          </div>
        </div>

        {/* Section 2 - Location */}
        <div className="bg-white border border-[#D3DFDA] rounded-2xl p-8">
          <h2 className="text-xl font-bold text-[#202828] mb-6 flex items-center gap-2 border-b border-[#D3DFDA] pb-4">
            <MapPin className="text-[#164A4A]" /> Location
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-[#455250] mb-2">Street Address *</label>
              <input required type="text" value={form.address} onChange={e => setForm({...form, address: e.target.value})} placeholder="Enter full address" className="w-full bg-[#F2EFE8] border border-[#D3DFDA] rounded-xl px-4 py-3 text-[#202828] outline-none focus:border-[#164A4A]" />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#455250] mb-2">Area / Locality *</label>
              <input required type="text" value={form.locality} onChange={e => setForm({...form, locality: e.target.value})} placeholder="Locality" className="w-full bg-[#F2EFE8] border border-[#D3DFDA] rounded-xl px-4 py-3 text-[#202828] outline-none focus:border-[#164A4A]" />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#455250] mb-2">City *</label>
              <input required type="text" value={form.city} onChange={e => setForm({...form, city: e.target.value})} placeholder="City" className="w-full bg-[#F2EFE8] border border-[#D3DFDA] rounded-xl px-4 py-3 text-[#202828] outline-none focus:border-[#164A4A]" />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#455250] mb-2">State *</label>
              <input required type="text" value={form.state} onChange={e => setForm({...form, state: e.target.value})} placeholder="State" className="w-full bg-[#F2EFE8] border border-[#D3DFDA] rounded-xl px-4 py-3 text-[#202828] outline-none focus:border-[#164A4A]" />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#455250] mb-2">Pincode *</label>
              <input required type="text" value={form.pinCode} onChange={e => setForm({...form, pinCode: e.target.value})} placeholder="Pincode" className="w-full bg-[#F2EFE8] border border-[#D3DFDA] rounded-xl px-4 py-3 text-[#202828] outline-none focus:border-[#164A4A]" />
            </div>
          </div>
        </div>

        {/* Section 3 - Operating Hours */}
        <div className="bg-white border border-[#D3DFDA] rounded-2xl p-8">
          <h2 className="text-xl font-bold text-[#202828] mb-6 flex items-center gap-2 border-b border-[#D3DFDA] pb-4">
            <Clock className="text-[#164A4A]" /> Operating Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-bold text-[#455250] mb-2">Opening Time *</label>
              <div className="flex gap-2">
                <input 
                  required 
                  type="text" 
                  maxLength={5}
                  placeholder="HH:MM"
                  value={form.openingTime.split(' ')[0]} 
                  onChange={e => {
                    let val = e.target.value.replace(/[^\d:]/g, '');
                    if (val.length === 2 && !val.includes(':') && e.target.value.length === 2) val += ':';
                    setForm({...form, openingTime: `${val} ${form.openingTime.split(' ')[1] || 'AM'}`})
                  }} 
                  className="w-full bg-[#F2EFE8] border border-[#D3DFDA] rounded-xl px-4 py-3 text-[#202828] outline-none focus:border-[#164A4A]" 
                />
                <select 
                  value={form.openingTime.split(' ')[1] || 'AM'}
                  onChange={e => setForm({...form, openingTime: `${form.openingTime.split(' ')[0] || '06:00'} ${e.target.value}`})}
                  className="bg-[#F2EFE8] border border-[#D3DFDA] rounded-xl px-4 py-3 text-[#202828] outline-none focus:border-[#164A4A] font-bold"
                >
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-[#455250] mb-2">Closing Time *</label>
              <div className="flex gap-2">
                <input 
                  required 
                  type="text" 
                  maxLength={5}
                  placeholder="HH:MM"
                  value={form.closingTime.split(' ')[0]} 
                  onChange={e => {
                    let val = e.target.value.replace(/[^\d:]/g, '');
                    if (val.length === 2 && !val.includes(':') && e.target.value.length === 2) val += ':';
                    setForm({...form, closingTime: `${val} ${form.closingTime.split(' ')[1] || 'PM'}`})
                  }} 
                  className="w-full bg-[#F2EFE8] border border-[#D3DFDA] rounded-xl px-4 py-3 text-[#202828] outline-none focus:border-[#164A4A]" 
                />
                <select 
                  value={form.closingTime.split(' ')[1] || 'PM'}
                  onChange={e => setForm({...form, closingTime: `${form.closingTime.split(' ')[0] || '10:00'} ${e.target.value}`})}
                  className="bg-[#F2EFE8] border border-[#D3DFDA] rounded-xl px-4 py-3 text-[#202828] outline-none focus:border-[#164A4A] font-bold"
                >
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-[#455250] mb-3">Working Days *</label>
            <div className="flex flex-wrap gap-3">
              {daysOfWeek.map(day => (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleDayToggle(day)}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors border ${
                    form.workingDays.includes(day)
                      ? 'bg-[#164A4A] text-white border-[#164A4A]'
                      : 'bg-[#F2EFE8] text-[#455250] border-[#D3DFDA] hover:border-[#164A4A]'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Section 4 & 5 - Mode and Services */}
        <div className="bg-white border border-[#D3DFDA] rounded-2xl p-8">
          <h2 className="text-xl font-bold text-[#202828] mb-6 flex items-center gap-2 border-b border-[#D3DFDA] pb-4">
            <Activity className="text-[#164A4A]" /> Training & Services
          </h2>
          <div className="mb-8">
            <label className="block text-sm font-bold text-[#455250] mb-3">Training Mode *</label>
            <div className="flex gap-4">
              {['offline', 'online', 'both'].map(mode => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setForm({...form, trainingMode: mode})}
                  className={`flex-1 py-3 rounded-xl border text-sm font-bold capitalize transition-colors ${
                    form.trainingMode === mode 
                      ? 'bg-green-50 border-[#164A4A] text-[#164A4A]' 
                      : 'bg-white border-[#D3DFDA] text-[#455250] hover:border-[#164A4A]'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-[#455250] mb-3">Services Offered</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {allServices.map(service => (
                <button
                  key={service}
                  type="button"
                  onClick={() => handleServiceToggle(service)}
                  className={`px-4 py-3 rounded-xl text-sm font-semibold transition-colors border text-left flex items-center gap-2 ${
                    form.services.includes(service)
                      ? 'bg-[#164A4A] text-white border-[#164A4A]'
                      : 'bg-[#F2EFE8] text-[#455250] border-[#D3DFDA] hover:border-[#164A4A]'
                  }`}
                >
                  <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${form.services.includes(service) ? 'border-white bg-white/20' : 'border-gray-300'}`}>
                    {form.services.includes(service) && <CheckCircle size={12} />}
                  </div>
                  {service}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Section 6 - Facilities */}
        <div className="bg-white border border-[#D3DFDA] rounded-2xl p-8">
          <h2 className="text-xl font-bold text-[#202828] mb-6 flex items-center gap-2 border-b border-[#D3DFDA] pb-4">
            <Building2 className="text-[#164A4A]" /> Facilities
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {commonFacilities.map(fac => {
              const Icon = fac.icon;
              return (
                <button
                  key={fac.id}
                  type="button"
                  onClick={() => handleFacilityToggle(fac.label)}
                  className={`px-4 py-3 rounded-xl text-sm font-semibold transition-colors border text-left flex items-center gap-3 ${
                    form.facilities.includes(fac.label)
                      ? 'bg-[#164A4A] text-white border-[#164A4A]'
                      : 'bg-[#F2EFE8] text-[#455250] border-[#D3DFDA] hover:border-[#164A4A]'
                  }`}
                >
                  <Icon size={18} className={form.facilities.includes(fac.label) ? 'text-white' : 'text-[#164A4A]'} />
                  {fac.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Section 7 - Subscription Plans */}
        <div className="bg-white border border-[#D3DFDA] rounded-2xl p-8">
          <div className="flex items-center justify-between border-b border-[#D3DFDA] pb-4 mb-6">
            <h2 className="text-xl font-bold text-[#202828] flex items-center gap-2">
              <CheckCircle className="text-[#164A4A]" /> Subscription Plans
            </h2>
            <button type="button" onClick={() => setShowPlanModal(true)} className="px-4 py-2 bg-[#164A4A] text-white text-sm font-bold rounded-xl hover:bg-[#C6A77D] transition-colors flex items-center gap-2">
              <Plus size={16} /> Add Plan
            </button>
          </div>
          
          {form.subscriptionPlans.length === 0 ? (
            <p className="text-sm text-[#455250] italic text-center py-4">No plans added yet. Click "Add Plan" to create one.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {form.subscriptionPlans.map((plan, idx) => (
                <div key={idx} className="border border-[#D3DFDA] rounded-xl p-4 flex justify-between items-start bg-[#F9F8F6]">
                  <div>
                    <h3 className="font-bold text-[#202828] text-lg">{plan.name}</h3>
                    <p className="text-sm font-bold text-[#164A4A]">₹{plan.price} / {plan.duration}</p>
                    <p className="text-xs text-[#455250] mt-2 line-clamp-2">{plan.features}</p>
                  </div>
                  <button type="button" onClick={() => handleRemovePlan(idx)} className="text-[#6fa3a0] hover:bg-red-50 p-1.5 rounded-lg transition-colors">
                    <CheckCircle size={16} className="rotate-45" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-4 pt-6">
          <button type="button" onClick={() => navigate('/admin/branches')} className="px-6 py-3 bg-white border border-[#D3DFDA] text-[#455250] font-bold rounded-xl hover:bg-[#F2EFE8] transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="px-8 py-3 bg-[#164A4A] text-white font-bold rounded-xl hover:bg-[#C6A77D] transition-colors flex items-center gap-2 disabled:opacity-70 shadow-lg shadow-[#164A4A]/20">
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
            Create Branch
          </button>
        </div>

      </form>

      {/* Subscription Plan Modal */}
      {showPlanModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] w-full max-w-lg rounded-2xl p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6 border-b border-[#D3DFDA] pb-4">
              <h2 className="text-2xl font-bold text-[#202828]">Create Subscription Plan</h2>
              <button type="button" onClick={() => setShowPlanModal(false)} className="text-[#455250] hover:text-[#6fa3a0] transition-colors">
                <CheckCircle size={24} className="rotate-45" />
              </button>
            </div>

            <form onSubmit={handleAddPlan} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-[#455250] mb-1">Plan Name</label>
                <input required value={planForm.name} onChange={e => setPlanForm({...planForm, name: e.target.value})} className="w-full border border-[#D3DFDA] rounded-lg px-4 py-2 outline-none focus:border-[#164A4A]" placeholder="e.g. Pro Tier" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-[#455250] mb-1">Price (₹)</label>
                  <input required type="text" value={planForm.price} onChange={e => setPlanForm({...planForm, price: e.target.value.replace(/[^0-9.]/g, '')})} className="w-full border border-[#D3DFDA] rounded-lg px-4 py-2 outline-none focus:border-[#164A4A]" placeholder="499" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#455250] mb-1">Duration</label>
                  <select value={planForm.duration} onChange={e => setPlanForm({...planForm, duration: e.target.value})} className="w-full border border-[#D3DFDA] rounded-lg px-4 py-2 outline-none focus:border-[#164A4A]">
                    <option value="Monthly">Monthly</option>
                    <option value="Yearly">Yearly</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-[#455250] mb-1">Features (comma separated)</label>
                <textarea required rows={4} value={planForm.features} onChange={e => setPlanForm({...planForm, features: e.target.value})} className="w-full border border-[#D3DFDA] rounded-lg px-4 py-2 outline-none focus:border-[#164A4A]" placeholder="Access to gym, 1 PT session, Locker access" />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setShowPlanModal(false)} className="px-4 py-2 text-[#455250] hover:bg-[#F1F5F9] rounded-lg font-medium transition-colors">
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2 bg-[#164A4A] text-white font-bold rounded-lg hover:bg-[#C6A77D] transition-colors">
                  Save Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GymAdminAddBranch;
