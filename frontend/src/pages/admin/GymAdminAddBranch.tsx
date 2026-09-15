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
  });

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
        <button onClick={() => navigate('/admin/branches')} className="w-10 h-10 bg-white border border-[#CCFBF1] rounded-xl flex items-center justify-center text-[#475569] hover:bg-[#F0FDFA] hover:text-[#16A34A] transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-[#1E293B] tracking-tight">Add New Branch</h1>
          <p className="text-[#475569] mt-1">Add a new location under your gym.</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Section 1 - Basic Information */}
        <div className="bg-white border border-[#CCFBF1] rounded-2xl p-8">
          <h2 className="text-xl font-bold text-[#1E293B] mb-6 flex items-center gap-2 border-b border-[#CCFBF1] pb-4">
            <Building2 className="text-[#16A34A]" /> Basic Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-[#475569] mb-2">Branch Name *</label>
              <input required type="text" value={form.branchName} onChange={e => setForm({...form, branchName: e.target.value})} placeholder="e.g. Main Branch" className="w-full bg-[#F8FAFC] border border-[#CCFBF1] rounded-xl px-4 py-3 text-[#1E293B] outline-none focus:border-[#16A34A]" />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#475569] mb-2">Branch Code *</label>
              <input required type="text" value={form.branchCode} onChange={e => setForm({...form, branchCode: e.target.value.toUpperCase()})} placeholder="e.g. GYM-001" className="w-full bg-[#F8FAFC] border border-[#CCFBF1] rounded-xl px-4 py-3 text-[#1E293B] outline-none focus:border-[#16A34A]" />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#475569] mb-2">Branch Phone Number *</label>
              <input required type="tel" maxLength={10} value={form.phone} onChange={e => setForm({...form, phone: e.target.value.replace(/\D/g, '')})} placeholder="e.g. 9876543210" className="w-full bg-[#F8FAFC] border border-[#CCFBF1] rounded-xl px-4 py-3 text-[#1E293B] outline-none focus:border-[#16A34A]" />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#475569] mb-2">Branch Email</label>
              <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="e.g. branch@gym.com" className="w-full bg-[#F8FAFC] border border-[#CCFBF1] rounded-xl px-4 py-3 text-[#1E293B] outline-none focus:border-[#16A34A]" />
            </div>
          </div>
        </div>

        {/* Section 2 - Location */}
        <div className="bg-white border border-[#CCFBF1] rounded-2xl p-8">
          <h2 className="text-xl font-bold text-[#1E293B] mb-6 flex items-center gap-2 border-b border-[#CCFBF1] pb-4">
            <MapPin className="text-[#16A34A]" /> Location
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-[#475569] mb-2">Street Address *</label>
              <input required type="text" value={form.address} onChange={e => setForm({...form, address: e.target.value})} placeholder="Enter full address" className="w-full bg-[#F8FAFC] border border-[#CCFBF1] rounded-xl px-4 py-3 text-[#1E293B] outline-none focus:border-[#16A34A]" />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#475569] mb-2">Area / Locality *</label>
              <input required type="text" value={form.locality} onChange={e => setForm({...form, locality: e.target.value})} placeholder="Locality" className="w-full bg-[#F8FAFC] border border-[#CCFBF1] rounded-xl px-4 py-3 text-[#1E293B] outline-none focus:border-[#16A34A]" />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#475569] mb-2">City *</label>
              <input required type="text" value={form.city} onChange={e => setForm({...form, city: e.target.value})} placeholder="City" className="w-full bg-[#F8FAFC] border border-[#CCFBF1] rounded-xl px-4 py-3 text-[#1E293B] outline-none focus:border-[#16A34A]" />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#475569] mb-2">State *</label>
              <input required type="text" value={form.state} onChange={e => setForm({...form, state: e.target.value})} placeholder="State" className="w-full bg-[#F8FAFC] border border-[#CCFBF1] rounded-xl px-4 py-3 text-[#1E293B] outline-none focus:border-[#16A34A]" />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#475569] mb-2">Pincode *</label>
              <input required type="text" value={form.pinCode} onChange={e => setForm({...form, pinCode: e.target.value})} placeholder="Pincode" className="w-full bg-[#F8FAFC] border border-[#CCFBF1] rounded-xl px-4 py-3 text-[#1E293B] outline-none focus:border-[#16A34A]" />
            </div>
          </div>
        </div>

        {/* Section 3 - Operating Hours */}
        <div className="bg-white border border-[#CCFBF1] rounded-2xl p-8">
          <h2 className="text-xl font-bold text-[#1E293B] mb-6 flex items-center gap-2 border-b border-[#CCFBF1] pb-4">
            <Clock className="text-[#16A34A]" /> Operating Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-bold text-[#475569] mb-2">Opening Time *</label>
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
                  className="w-full bg-[#F8FAFC] border border-[#CCFBF1] rounded-xl px-4 py-3 text-[#1E293B] outline-none focus:border-[#16A34A]" 
                />
                <select 
                  value={form.openingTime.split(' ')[1] || 'AM'}
                  onChange={e => setForm({...form, openingTime: `${form.openingTime.split(' ')[0] || '06:00'} ${e.target.value}`})}
                  className="bg-[#F8FAFC] border border-[#CCFBF1] rounded-xl px-4 py-3 text-[#1E293B] outline-none focus:border-[#16A34A] font-bold"
                >
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-[#475569] mb-2">Closing Time *</label>
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
                  className="w-full bg-[#F8FAFC] border border-[#CCFBF1] rounded-xl px-4 py-3 text-[#1E293B] outline-none focus:border-[#16A34A]" 
                />
                <select 
                  value={form.closingTime.split(' ')[1] || 'PM'}
                  onChange={e => setForm({...form, closingTime: `${form.closingTime.split(' ')[0] || '10:00'} ${e.target.value}`})}
                  className="bg-[#F8FAFC] border border-[#CCFBF1] rounded-xl px-4 py-3 text-[#1E293B] outline-none focus:border-[#16A34A] font-bold"
                >
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-[#475569] mb-3">Working Days *</label>
            <div className="flex flex-wrap gap-3">
              {daysOfWeek.map(day => (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleDayToggle(day)}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors border ${
                    form.workingDays.includes(day)
                      ? 'bg-[#16A34A] text-white border-[#16A34A]'
                      : 'bg-[#F8FAFC] text-[#475569] border-[#CCFBF1] hover:border-[#16A34A]'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Section 4 & 5 - Mode and Services */}
        <div className="bg-white border border-[#CCFBF1] rounded-2xl p-8">
          <h2 className="text-xl font-bold text-[#1E293B] mb-6 flex items-center gap-2 border-b border-[#CCFBF1] pb-4">
            <Activity className="text-[#16A34A]" /> Training & Services
          </h2>
          <div className="mb-8">
            <label className="block text-sm font-bold text-[#475569] mb-3">Training Mode *</label>
            <div className="flex gap-4">
              {['offline', 'online', 'both'].map(mode => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setForm({...form, trainingMode: mode})}
                  className={`flex-1 py-3 rounded-xl border text-sm font-bold capitalize transition-colors ${
                    form.trainingMode === mode 
                      ? 'bg-green-50 border-[#16A34A] text-[#16A34A]' 
                      : 'bg-white border-[#CCFBF1] text-[#475569] hover:border-[#16A34A]'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-[#475569] mb-3">Services Offered</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {allServices.map(service => (
                <button
                  key={service}
                  type="button"
                  onClick={() => handleServiceToggle(service)}
                  className={`px-4 py-3 rounded-xl text-sm font-semibold transition-colors border text-left flex items-center gap-2 ${
                    form.services.includes(service)
                      ? 'bg-[#16A34A] text-white border-[#16A34A]'
                      : 'bg-[#F8FAFC] text-[#475569] border-[#CCFBF1] hover:border-[#16A34A]'
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
        <div className="bg-white border border-[#CCFBF1] rounded-2xl p-8">
          <h2 className="text-xl font-bold text-[#1E293B] mb-6 flex items-center gap-2 border-b border-[#CCFBF1] pb-4">
            <Building2 className="text-[#16A34A]" /> Facilities
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
                      ? 'bg-[#16A34A] text-white border-[#16A34A]'
                      : 'bg-[#F8FAFC] text-[#475569] border-[#CCFBF1] hover:border-[#16A34A]'
                  }`}
                >
                  <Icon size={18} className={form.facilities.includes(fac.label) ? 'text-white' : 'text-[#16A34A]'} />
                  {fac.label}
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-6">
          <button type="button" onClick={() => navigate('/admin/branches')} className="px-6 py-3 bg-white border border-[#CCFBF1] text-[#475569] font-bold rounded-xl hover:bg-[#F8FAFC] transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="px-8 py-3 bg-[#16A34A] text-white font-bold rounded-xl hover:bg-[#15803D] transition-colors flex items-center gap-2 disabled:opacity-70 shadow-lg shadow-[#16A34A]/20">
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
            Create Branch
          </button>
        </div>

      </form>
    </div>
  );
};

export default GymAdminAddBranch;
