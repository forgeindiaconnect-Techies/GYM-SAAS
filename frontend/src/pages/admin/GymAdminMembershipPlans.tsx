import { useState, useEffect } from 'react';
import { Plus, Check, Edit2, Users, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';

const mockPlans = [
  { _id: '1', name: 'Basic Tier', price: '29.99', duration: 'Monthly', subscribers: 145, isPopular: false, features: 'Access to gym equipment, Locker room access, 1 free personal training session' },
  { _id: '2', name: 'Pro Tier', price: '49.99', duration: 'Monthly', subscribers: 312, isPopular: true, features: 'All Basic features, Group fitness classes, Access to sauna/pool, Guest passes (2/month)' },
  { _id: '3', name: 'Elite Tier', price: '89.99', duration: 'Monthly', subscribers: 84, isPopular: false, features: 'All Pro features, Unlimited guest passes, 1 PT session per week, Free nutrition consultation' },
];

const GymAdminMembershipPlans = () => {
  const { user } = useAuth();
  const [gym, setGym] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    duration: 'Monthly',
    features: ''
  });

  useEffect(() => {
    if (user?.gymId) {
      api.get(`/gyms/${user.gymId}`)
        .then(res => {
          setGym(res.data.gym);
          setIsLoading(false);
        })
        .catch(err => {
          console.error(err);
          setIsLoading(false);
        });
    }
  }, [user]);

  const plansToDisplay = gym?.subscriptionPlans?.length > 0 ? gym.subscriptionPlans : mockPlans;

  const handleOpenModal = (plan?: any, index?: number) => {
    if (plan) {
      setFormData({
        name: plan.name || '',
        price: plan.price || '',
        duration: plan.duration || 'Monthly',
        features: plan.features || ''
      });
      setEditingIndex(index as number);
    } else {
      setFormData({ name: '', price: '', duration: 'Monthly', features: '' });
      setEditingIndex(null);
    }
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gym) return;
    
    let currentPlans = gym.subscriptionPlans || [];
    
    if (editingIndex !== null) {
      currentPlans = currentPlans.map((p: any, i: number) => i === editingIndex ? { ...p, ...formData } : p);
    } else {
      currentPlans = [...currentPlans, formData];
    }

    try {
      const res = await api.put(`/gyms/${gym._id}`, { subscriptionPlans: currentPlans });
      setGym(res.data.gym);
      setShowModal(false);
    } catch (err) {
      console.error(err);
      alert('Failed to save plan');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#1E293B] tracking-tight">Membership Plans</h1>
          <p className="text-[#475569] mt-1">Configure pricing tiers and subscription options for your gym.</p>
        </div>
        <button onClick={() => handleOpenModal()} className="px-4 py-2 bg-[#16A34A] text-[#1E293B] font-bold rounded-xl hover:bg-[#15803D] transition-colors flex items-center gap-2 shadow-lg shadow-[#16A34A]/20 self-start md:self-auto">
          <Plus size={20} /> Create New Plan
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {isLoading ? (
          <div className="col-span-3 text-center py-10 text-[#475569]">Loading plans...</div>
        ) : plansToDisplay.map((plan: any, index: number) => {
          const isPopular = plan.isPopular || index === 1; // Highlight the middle plan normally
          const featureList = typeof plan.features === 'string' 
            ? plan.features.split(',').map((f: string) => f.trim()).filter(Boolean)
            : (plan.features || []);

          return (
            <div key={plan._id || index} className={`bg-[#FFFFFF] rounded-2xl p-8 relative flex flex-col transition-all ${isPopular ? 'border-2 border-[#16A34A] shadow-[0_0_30px_rgba(255,51,102,0.1)] transform md:-translate-y-2' : 'border border-[#CCFBF1] hover:border-[#16A34A]/50'}`}>
            
            {isPopular && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <span className="bg-[#16A34A] text-white text-xs font-black uppercase tracking-wider py-1 px-4 rounded-full shadow-lg">
                  Most Popular
                </span>
              </div>
            )}

            <div className="flex justify-between items-start mb-4">
              <h3 className="text-2xl font-bold text-[#1E293B]">{plan.name}</h3>
              <button onClick={() => handleOpenModal(plan, index)} className="p-2 text-[#475569] hover:text-[#16A34A] hover:bg-[#16A34A]/10 rounded-lg transition-colors">
                <Edit2 size={18} />
              </button>
            </div>
            
            <div className="mb-6 flex items-baseline">
              <span className="text-4xl font-black text-[#1E293B]">${plan.price}</span>
              <span className="text-[#475569] ml-2 font-medium">/ {plan.duration.toLowerCase()}</span>
            </div>

            <div className="flex items-center space-x-2 mb-8 bg-[#FFFFFF] p-3 rounded-xl border border-[#CCFBF1]">
              <Users size={18} className="text-[#16A34A]" />
              <span className="text-sm font-semibold text-[#1E293B]">{plan.subscribers}</span>
              <span className="text-sm text-[#475569]">Active Subscribers</span>
            </div>

            <div className="flex-1">
              <p className="text-sm font-bold text-[#1E293B] mb-4 uppercase tracking-wider">Features included:</p>
              <ul className="space-y-4">
                {featureList.map((feature: string, idx: number) => (
                  <li key={idx} className="flex items-start">
                    <Check size={18} className="text-green-500 mr-3 shrink-0 mt-0.5" />
                    <span className="text-sm text-[#475569] leading-tight">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-[#CCFBF1]">
              <button onClick={() => handleOpenModal(plan, index)} className="w-full py-3 rounded-xl font-bold transition-colors bg-[#16A34A] text-white hover:bg-[#15803D] shadow-lg shadow-[#16A34A]/20">
                Edit Plan
              </button>
            </div>
          </div>
          );
        })}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] w-full max-w-lg rounded-2xl p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6 border-b border-[#CCFBF1] pb-4">
              <h2 className="text-2xl font-bold text-[#1E293B]">
                {editingIndex !== null ? 'Edit Plan' : 'Create New Plan'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-[#475569] hover:text-[#EF4444] transition-colors">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-[#475569] mb-1">Plan Name</label>
                <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border border-[#CCFBF1] rounded-lg px-4 py-2 outline-none focus:border-[#16A34A]" placeholder="e.g. Pro Tier" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-[#475569] mb-1">Price ($)</label>
                  <input required type="number" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full border border-[#CCFBF1] rounded-lg px-4 py-2 outline-none focus:border-[#16A34A]" placeholder="49.99" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#475569] mb-1">Duration</label>
                  <select value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} className="w-full border border-[#CCFBF1] rounded-lg px-4 py-2 outline-none focus:border-[#16A34A]">
                    <option value="Monthly">Monthly</option>
                    <option value="Yearly">Yearly</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-[#475569] mb-1">Features (comma separated)</label>
                <textarea required rows={4} value={formData.features} onChange={e => setFormData({...formData, features: e.target.value})} className="w-full border border-[#CCFBF1] rounded-lg px-4 py-2 outline-none focus:border-[#16A34A]" placeholder="Access to gym, 1 PT session, Locker access" />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-[#475569] hover:bg-[#F1F5F9] rounded-lg font-medium transition-colors">
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2 bg-[#16A34A] text-white font-bold rounded-lg hover:bg-[#15803D] transition-colors">
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

export default GymAdminMembershipPlans;
