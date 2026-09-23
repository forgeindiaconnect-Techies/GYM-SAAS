import { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { ArrowLeft, Building2, MapPin, Phone, CreditCard, Save } from 'lucide-react';
import api from '../../utils/api';

const COMMON_EQUIPMENT = [
  'Treadmills', 'Ellipticals', 'Rowing Machines', 'Stationary Bikes', 
  'Dumbbells', 'Kettlebells', 'Barbells', 'Squat Racks', 'Bench Press', 
  'Cable Machines', 'Smith Machine', 'Leg Press Machine', 
  'Pull-up Bars', 'Resistance Bands', 'Medicine Balls', 'Yoga Mats'
];

const SuperAdminGymsEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [step, setStep] = useState<1 | 2>(1); // 1: Edit, 2: Review
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('ACTIVE');

  const [form, setForm] = useState({
    name: '',
    logo: '',
    description: '',
    gymType: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    city: '',
    state: '',
    pinCode: '',
    memberCapacity: '',
    trainerCapacity: '',
    equipment: '',
    subscriptionPlan: '',
    subscriptionStartDate: '',
    subscriptionEndDate: '',
    subscriptionStatus: 'Active',
  });

  useEffect(() => {
    const fetchGym = async () => {
      try {
        const res = await api.get(`/gyms/${id}`);
        const gym = res.data.gym;
        setStatus(gym.status || 'ACTIVE');
        setForm({
          name: gym.name || '',
          logo: gym.logo || '',
          description: gym.description || '',
          gymType: gym.gymType || '',
          email: gym.email || '',
          phone: gym.phone || '',
          website: gym.website || '',
          address: gym.location?.address || '',
          city: gym.location?.city || '',
          state: gym.location?.state || '',
          pinCode: gym.location?.pinCode || '',
          memberCapacity: gym.memberCapacity ? String(gym.memberCapacity) : '',
          trainerCapacity: gym.trainerCapacity ? String(gym.trainerCapacity) : '',
          equipment: gym.equipment ? gym.equipment.join(', ') : '',
          subscriptionPlan: gym.subscription?.plan || '',
          subscriptionStartDate: gym.subscription?.startDate ? gym.subscription.startDate.split('T')[0] : '',
          subscriptionEndDate: gym.subscription?.endDate ? gym.subscription.endDate.split('T')[0] : '',
          subscriptionStatus: gym.subscription?.status || 'Active',
        });
      } catch (err) {
        setError('Failed to fetch gym details');
      }
    };
    if (id) fetchGym();
  }, [id]);

  const handleChange = (e: any) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm({ ...form, [e.target.name]: value });
  };

  const handleReview = () => {
    setError('');
    if (!form.name || !form.gymType || !form.email || !form.phone || !form.address || !form.city || !form.state || !form.pinCode || !form.subscriptionPlan || !form.subscriptionStartDate) {
      setError('Please fill in all required fields marked with *');
      window.scrollTo(0, 0);
      return;
    }
    setStep(2);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async () => {
    setError('');
    setIsLoading(true);
    try {
      const payload = {
        ...form,
        memberCapacity: form.memberCapacity ? parseInt(form.memberCapacity) : undefined,
        trainerCapacity: form.trainerCapacity ? parseInt(form.trainerCapacity) : undefined,
        equipment: form.equipment ? form.equipment.split(',').map(e => e.trim()).filter(Boolean) : [],
        status
      };
      await api.put(`/gyms/${id}`, payload);
      navigate('/super-admin/gyms/all');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update gym');
      window.scrollTo(0, 0);
      setStep(1);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div className="flex items-center space-x-4">
        <Link to="/super-admin/gyms/all" className="p-2 bg-[#FFFFFF] hover:bg-[#E8E5DA] rounded-xl transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">{step === 1 ? 'Edit Gym' : 'Review Changes'}</h1>
          <p className="text-[#4A514D] text-sm">Update the details for {form.name || 'this gym'}.</p>
        </div>
      </div>

      {error && (
        <div className="bg-[#8FA89B]/10 border border-[#8FA89B]/30 text-teal-400 p-4 rounded-xl text-sm">
          {error}
        </div>
      )}

      {step === 1 && (
        <form className="space-y-8" onSubmit={(e) => { e.preventDefault(); handleReview(); }}>
          
          {/* Gym Information */}
          <section className="bg-[#FFFFFF] border border-[#DCD9CD] rounded-2xl p-6 md:p-8">
            <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-[#DCD9CD]">
              <Building2 className="text-[#34483F]" size={24} />
              <h2 className="text-xl font-bold">Gym Information</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[#4A514D] mb-2">Gym Name *</label>
                <input type="text" name="name" value={form.name} onChange={handleChange} className="w-full bg-[#FFFFFF] border border-[#DCD9CD] rounded-xl px-4 py-3 text-sm focus:border-[#34483F] outline-none transition-colors" placeholder="e.g. FitZone Elite" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#4A514D] mb-2">Gym Type *</label>
                <select name="gymType" value={form.gymType} onChange={handleChange} className="w-full bg-[#FFFFFF] border border-[#DCD9CD] rounded-xl px-4 py-3 text-sm focus:border-[#34483F] outline-none transition-colors appearance-none">
                  <option value="">Select Type</option>
                  <option value="Fitness Center">Fitness Center</option>
                  <option value="Premium Gym">Premium Gym</option>
                  <option value="CrossFit">CrossFit</option>
                  <option value="Women's Gym">Women's Gym</option>
                  <option value="Yoga & Wellness">Yoga & Wellness</option>
                  <option value="Multi-Specialty Gym">Multi-Specialty Gym</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[#4A514D] mb-2">Gym Logo URL (Optional)</label>
                <input type="text" name="logo" value={form.logo} onChange={handleChange} className="w-full bg-[#FFFFFF] border border-[#DCD9CD] rounded-xl px-4 py-3 text-sm focus:border-[#34483F] outline-none transition-colors" placeholder="https://..." />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[#4A514D] mb-2">Gym Description (Optional)</label>
                <textarea name="description" value={form.description} onChange={handleChange} rows={3} className="w-full bg-[#FFFFFF] border border-[#DCD9CD] rounded-xl px-4 py-3 text-sm focus:border-[#34483F] outline-none transition-colors resize-none" placeholder="Brief description of the gym..."></textarea>
              </div>
            </div>
          </section>

          {/* Capacity & Equipment */}
          <section className="bg-[#FFFFFF] border border-[#DCD9CD] rounded-2xl p-6 md:p-8">
            <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-[#DCD9CD]">
              <Building2 className="text-[#34483F]" size={24} />
              <h2 className="text-xl font-bold">Capacity & Equipment</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[#4A514D] mb-2">Maximum Member Capacity (Optional)</label>
                <input type="number" name="memberCapacity" value={form.memberCapacity} onChange={handleChange} className="w-full bg-[#FFFFFF] border border-[#DCD9CD] rounded-xl px-4 py-3 text-sm focus:border-[#34483F] outline-none transition-colors" placeholder="e.g. 500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#4A514D] mb-2">Maximum Trainer Capacity (Optional)</label>
                <input type="number" name="trainerCapacity" value={form.trainerCapacity} onChange={handleChange} className="w-full bg-[#FFFFFF] border border-[#DCD9CD] rounded-xl px-4 py-3 text-sm focus:border-[#34483F] outline-none transition-colors" placeholder="e.g. 20" />
              </div>
              <div className="md:col-span-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2">
                  <label className="block text-sm font-medium text-[#4A514D]">Equipment Available (Comma-separated)</label>
                  <select 
                    className="bg-[#FFFFFF] border border-[#DCD9CD] rounded-xl px-3 py-1.5 text-sm text-[#202522] focus:border-[#34483F] outline-none"
                    onChange={(e) => {
                      if (!e.target.value) return;
                      const selected = e.target.value;
                      const currentEq = form.equipment.trim();
                      const currentArray = currentEq ? currentEq.split(',').map(item => item.trim()) : [];
                      
                      if (!currentArray.includes(selected)) {
                        currentArray.push(selected);
                        setForm({ ...form, equipment: currentArray.join(', ') });
                      }
                      e.target.value = '';
                    }}
                    defaultValue=""
                  >
                    <option value="" disabled>Quick Add...</option>
                    {COMMON_EQUIPMENT.map(eq => (
                      <option key={eq} value={eq}>{eq}</option>
                    ))}
                  </select>
                </div>
                <textarea name="equipment" value={form.equipment} onChange={handleChange} rows={3} className="w-full bg-[#FFFFFF] border border-[#DCD9CD] rounded-xl px-4 py-3 text-sm focus:border-[#34483F] outline-none transition-colors resize-none" placeholder="Treadmills, Dumbbells, Squat Racks..."></textarea>
              </div>
            </div>
          </section>

          {/* Contact Information */}
          <section className="bg-[#FFFFFF] border border-[#DCD9CD] rounded-2xl p-6 md:p-8">
            <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-[#DCD9CD]">
              <Phone className="text-[#34483F]" size={24} />
              <h2 className="text-xl font-bold">Contact Information</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[#4A514D] mb-2">Official Email *</label>
                <input type="email" name="email" value={form.email} onChange={handleChange} className="w-full bg-[#FFFFFF] border border-[#DCD9CD] rounded-xl px-4 py-3 text-sm focus:border-[#34483F] outline-none transition-colors" placeholder="info@gym.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#4A514D] mb-2">Phone Number *</label>
                <input type="tel" name="phone" value={form.phone} onChange={handleChange} className="w-full bg-[#FFFFFF] border border-[#DCD9CD] rounded-xl px-4 py-3 text-sm focus:border-[#34483F] outline-none transition-colors" placeholder="+1 234 567 8900" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[#4A514D] mb-2">Website (Optional)</label>
                <input type="text" name="website" value={form.website} onChange={handleChange} className="w-full bg-[#FFFFFF] border border-[#DCD9CD] rounded-xl px-4 py-3 text-sm focus:border-[#34483F] outline-none transition-colors" placeholder="https://www.gym.com" />
              </div>
            </div>
          </section>

          {/* Location Information */}
          <section className="bg-[#FFFFFF] border border-[#DCD9CD] rounded-2xl p-6 md:p-8">
            <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-[#DCD9CD]">
              <MapPin className="text-[#34483F]" size={24} />
              <h2 className="text-xl font-bold">Location Information</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[#4A514D] mb-2">Address *</label>
                <input type="text" name="address" value={form.address} onChange={handleChange} className="w-full bg-[#FFFFFF] border border-[#DCD9CD] rounded-xl px-4 py-3 text-sm focus:border-[#34483F] outline-none transition-colors" placeholder="123 Fitness St" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#4A514D] mb-2">City *</label>
                <input type="text" name="city" value={form.city} onChange={handleChange} className="w-full bg-[#FFFFFF] border border-[#DCD9CD] rounded-xl px-4 py-3 text-sm focus:border-[#34483F] outline-none transition-colors" placeholder="New York" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#4A514D] mb-2">State *</label>
                <input type="text" name="state" value={form.state} onChange={handleChange} className="w-full bg-[#FFFFFF] border border-[#DCD9CD] rounded-xl px-4 py-3 text-sm focus:border-[#34483F] outline-none transition-colors" placeholder="NY" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#4A514D] mb-2">Pincode *</label>
                <input type="text" name="pinCode" value={form.pinCode} onChange={handleChange} className="w-full bg-[#FFFFFF] border border-[#DCD9CD] rounded-xl px-4 py-3 text-sm focus:border-[#34483F] outline-none transition-colors" placeholder="10001" />
              </div>
            </div>
          </section>

          {/* Subscription */}
          <section className="bg-[#FFFFFF] border border-[#DCD9CD] rounded-2xl p-6 md:p-8">
            <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-[#DCD9CD]">
              <CreditCard className="text-[#34483F]" size={24} />
              <h2 className="text-xl font-bold">Subscription Setup</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[#4A514D] mb-2">Subscription Plan *</label>
                <select name="subscriptionPlan" value={form.subscriptionPlan} onChange={handleChange} className="w-full bg-[#FFFFFF] border border-[#DCD9CD] rounded-xl px-4 py-3 text-sm focus:border-[#34483F] outline-none transition-colors appearance-none">
                  <option value="">Select Plan</option>
                  <option value="Basic (Free Tier)">Basic (Free Tier)</option>
                  <option value="Pro ($49/mo)">Pro ($49/mo)</option>
                  <option value="Enterprise ($149/mo)">Enterprise ($149/mo)</option>
                  <option value="Custom Negotiated">Custom Negotiated</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#4A514D] mb-2">Status</label>
                <select name="subscriptionStatus" value={form.subscriptionStatus} onChange={handleChange} className="w-full bg-[#FFFFFF] border border-[#DCD9CD] rounded-xl px-4 py-3 text-sm focus:border-[#34483F] outline-none transition-colors appearance-none">
                  <option value="Active">Active</option>
                  <option value="Trial">Trial</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#4A514D] mb-2">Start Date *</label>
                <input type="date" name="subscriptionStartDate" value={form.subscriptionStartDate} onChange={handleChange} className="w-full bg-[#FFFFFF] border border-[#DCD9CD] rounded-xl px-4 py-3 text-sm focus:border-[#34483F] outline-none transition-colors [color-scheme:dark]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#4A514D] mb-2">End Date (Optional)</label>
                <input type="date" name="subscriptionEndDate" value={form.subscriptionEndDate} onChange={handleChange} className="w-full bg-[#FFFFFF] border border-[#DCD9CD] rounded-xl px-4 py-3 text-sm focus:border-[#34483F] outline-none transition-colors [color-scheme:dark]" />
              </div>
            </div>
          </section>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-4">
            <Link 
              to="/super-admin/gyms/all"
              className="px-6 py-3 bg-[#FFFFFF] text-[#202522] rounded-xl font-semibold hover:bg-[#E8E5DA] transition-colors"
            >
              Cancel
            </Link>
            <button 
              type="submit"
              className="px-6 py-3 bg-[#34483F] text-white rounded-xl font-bold hover:bg-[#C6A77D] transition-colors"
            >
              Review Changes
            </button>
          </div>
        </form>
      )}

      {step === 2 && (
        <div className="space-y-8">
          <div className="bg-[#FFFFFF] border border-[#DCD9CD] rounded-2xl p-6 md:p-8 space-y-8">
            
            <div>
              <h3 className="text-lg font-bold text-[#34483F] mb-4">1. Gym Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-[#4A514D]">Name:</span> <span className="text-[#202522] ml-2">{form.name}</span></div>
                <div><span className="text-[#4A514D]">Type:</span> <span className="text-[#202522] ml-2">{form.gymType}</span></div>
                <div><span className="text-[#4A514D]">Capacity (Members):</span> <span className="text-[#202522] ml-2">{form.memberCapacity || 'N/A'}</span></div>
                <div><span className="text-[#4A514D]">Capacity (Trainers):</span> <span className="text-[#202522] ml-2">{form.trainerCapacity || 'N/A'}</span></div>
                <div className="col-span-2"><span className="text-[#4A514D]">Logo URL:</span> <span className="text-[#202522] ml-2">{form.logo || 'N/A'}</span></div>
                <div className="col-span-2"><span className="text-[#4A514D]">Equipment:</span> <span className="text-[#202522] ml-2">{form.equipment || 'N/A'}</span></div>
                <div className="col-span-2"><span className="text-[#4A514D]">Description:</span> <span className="text-[#202522] ml-2">{form.description || 'N/A'}</span></div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-[#34483F] mb-4">2. Contact & Location</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-[#4A514D]">Email:</span> <span className="text-[#202522] ml-2">{form.email}</span></div>
                <div><span className="text-[#4A514D]">Phone:</span> <span className="text-[#202522] ml-2">{form.phone}</span></div>
                <div className="col-span-2"><span className="text-[#4A514D]">Website:</span> <span className="text-[#202522] ml-2">{form.website || 'N/A'}</span></div>
                <div className="col-span-2"><span className="text-[#4A514D]">Address:</span> <span className="text-[#202522] ml-2">{form.address}, {form.city}, {form.state} {form.pinCode}</span></div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-[#34483F] mb-4">3. Subscription</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-[#4A514D]">Plan:</span> <span className="text-[#202522] ml-2">{form.subscriptionPlan}</span></div>
                <div><span className="text-[#4A514D]">Status:</span> <span className="text-[#202522] ml-2">{form.subscriptionStatus}</span></div>
                <div><span className="text-[#4A514D]">Start:</span> <span className="text-[#202522] ml-2">{form.subscriptionStartDate}</span></div>
                <div><span className="text-[#4A514D]">End:</span> <span className="text-[#202522] ml-2">{form.subscriptionEndDate || 'N/A'}</span></div>
              </div>
            </div>

          </div>

          <div className="flex flex-col sm:flex-row justify-end items-center gap-4 pt-4">
            <button 
              onClick={() => setStep(1)}
              className="w-full sm:w-auto px-6 py-3 bg-[#FFFFFF] text-[#202522] rounded-xl font-semibold hover:bg-[#E8E5DA] transition-colors text-center"
            >
              Back to Edit
            </button>
            <button 
              disabled={isLoading}
              onClick={handleSubmit}
              className="w-full sm:w-auto px-6 py-3 bg-[#34483F] text-white rounded-xl font-bold hover:bg-[#C6A77D] transition-colors flex items-center justify-center gap-2"
            >
              <Save size={18} />
              <span>{isLoading ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default SuperAdminGymsEdit;
