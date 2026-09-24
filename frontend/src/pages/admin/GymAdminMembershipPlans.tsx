import { useState, useEffect } from 'react';
import { Plus, Check, Edit2, Users, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';

const mockPlans = [
  { _id: '1', name: 'free trial', price: '0', duration: '1 day', subscribers: 145, isPopular: false, features: 'Gym Setup, Member Management (Up to 10), Trainer Management (1 Trainer), Membership Plans (1 Plan), Exercise Plans, Basic Diet Plans, Limited AI Suggestions' },
  { _id: '2', name: 'basic', price: '399', duration: '1 month', subscribers: 312, isPopular: true, features: 'Gym Setup, Member Management (Up to 100), Trainer Management (Up to 5), Membership Plans (5 Plans), Exercise & Diet Plans, AI Suggestions, Reports & Analytics' },
  { _id: '3', name: 'premium', price: '799', duration: '3 months', subscribers: 84, isPopular: false, features: 'Gym Setup, Unlimited Member Management, Unlimited Trainer Management, Unlimited Membership Plans, Exercise Plans, Diet Plans, Advanced AI Suggestions, Advanced Member Progress Tracking, Attendance Management, Payment Tracking, Advanced Reports & Analytics, Unlimited AI Workout Generation, Unlimited AI Diet Generation, Gym Store — Sell Supplements & Merch, Gym Store — Online Orders & Payments, Gym Store — Inventory & Offline Sales, Notifications, Multiple Branches, Priority Support' },
  { _id: '4', name: 'basic annual', price: '3990', duration: '1 year', subscribers: 45, isPopular: true, features: 'Gym Setup, Member Management (Up to 100), Trainer Management (Up to 5), Membership Plans (5 Plans), Exercise & Diet Plans, AI Suggestions, Reports & Analytics' },
  { _id: '5', name: 'premium annual', price: '7990', duration: '1 year', subscribers: 12, isPopular: false, features: 'Gym Setup, Unlimited Member Management, Unlimited Trainer Management, Unlimited Membership Plans, Exercise Plans, Diet Plans, Advanced AI Suggestions, Advanced Member Progress Tracking, Attendance Management, Payment Tracking, Advanced Reports & Analytics, Unlimited AI Workout Generation, Unlimited AI Diet Generation, Gym Store — Sell Supplements & Merch, Gym Store — Online Orders & Payments, Gym Store — Inventory & Offline Sales, Notifications, Multiple Branches, Priority Support' },
];

const GymAdminMembershipPlans = () => {
  const { user } = useAuth();
  const [gym, setGym] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    duration: 'Monthly',
    features: ''
  });
  const [billingCycle, setBillingCycle] = useState('monthly');

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
  
  let filteredPlans = plansToDisplay.filter((plan: any) => {
    const dur = (plan.duration || '').toLowerCase();
    if (billingCycle === 'monthly') {
      return !dur.includes('year') && !dur.includes('annual');
    } else {
      return dur.includes('year') || dur.includes('annual');
    }
  });

  // Inject annual mock plans if none exist so the user can see/save them
  if (billingCycle === 'annually' && filteredPlans.length === 0) {
    filteredPlans = mockPlans.filter(p => p.duration.includes('year'));
  }

  const handleOpenModal = (plan?: any) => {
    if (plan) {
      setFormData({
        name: plan.name || '',
        price: plan.price || '',
        duration: plan.duration || 'Monthly',
        features: plan.features || ''
      });
      setEditingId(plan._id);
    } else {
      setFormData({ name: '', price: '', duration: 'Monthly', features: '' });
      setEditingId(null);
    }
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gym) return;
    
    let currentPlans = gym.subscriptionPlans || [];
    
    if (editingId) {
      // If it's a mock plan being saved for the first time, it won't be in currentPlans yet
      const exists = currentPlans.some((p: any) => p._id === editingId);
      if (exists) {
        currentPlans = currentPlans.map((p: any) => p._id === editingId ? { ...p, ...formData } : p);
      } else {
        currentPlans = [...currentPlans, { ...formData }];
      }
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
          <h1 className="text-3xl font-bold text-[#202828] tracking-tight">Membership Plans</h1>
          <p className="text-[#455250] mt-1">Configure pricing tiers and subscription options for your gym.</p>
        </div>
        <button onClick={() => handleOpenModal()} className="px-4 py-2 bg-[#164A4A] text-white font-bold rounded-xl hover:bg-[#164A4A]/90 transition-colors flex items-center gap-2 shadow-lg shadow-[#164A4A]/20 self-start md:self-auto">
          <Plus size={20} /> Create New Plan
        </button>
      </div>
      
      <div className="flex justify-center mt-4">
        <div className="bg-[#FFFFFF] p-1.5 rounded-xl border border-[#D3DFDA] inline-flex shadow-sm">
          <button 
            onClick={() => setBillingCycle('monthly')}
            className={`px-8 py-2.5 rounded-lg text-sm font-bold transition-all ${billingCycle === 'monthly' ? 'bg-[#164A4A] text-white shadow-md' : 'text-[#455250] hover:bg-gray-50'}`}
          >
            Monthly
          </button>
          <button 
            onClick={() => setBillingCycle('annually')}
            className={`px-8 py-2.5 rounded-lg text-sm font-bold transition-all ${billingCycle === 'annually' ? 'bg-[#164A4A] text-white shadow-md' : 'text-[#455250] hover:bg-gray-50'}`}
          >
            Annually
          </button>
        </div>
      </div>

      {filteredPlans.length === 0 ? (
        <div className="text-center py-20 bg-white border border-[#D3DFDA] rounded-3xl">
          <h3 className="text-lg font-bold text-[#202828] mb-2">No {billingCycle} plans found</h3>
          <p className="text-[#455250] mb-4">You haven't created any {billingCycle} membership plans yet.</p>
          <button onClick={() => handleOpenModal()} className="px-6 py-2 bg-[#164A4A] text-white font-bold rounded-xl">Create One Now</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {isLoading ? (
            <div className="col-span-3 text-center py-10 text-[#455250]">Loading plans...</div>
          ) : filteredPlans.map((plan: any, index: number) => {
          const isPopular = plan.isPopular || index === 1; // Highlight the middle plan normally
          const featureList = typeof plan.features === 'string' 
            ? plan.features.split(',').map((f: string) => f.trim()).filter(Boolean)
            : (plan.features || []);

          return (
            <div key={plan._id || index} className={`bg-[#FFFFFF] rounded-2xl p-8 relative flex flex-col transition-all ${isPopular ? 'border-2 border-[#164A4A] shadow-[0_0_30px_rgba(255,51,102,0.1)] transform md:-translate-y-2' : 'border border-[#D3DFDA] hover:border-[#164A4A]/50'}`}>
            
            {isPopular && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <span className="bg-[#164A4A] text-white text-xs font-black uppercase tracking-wider py-1 px-4 rounded-full shadow-lg">
                  Most Popular
                </span>
              </div>
            )}

            <div className="flex justify-between items-start mb-4">
              <h3 className="text-2xl font-bold text-[#202828]">{plan.name}</h3>
              <button onClick={() => handleOpenModal(plan, index)} className="p-2 text-[#455250] hover:text-[#164A4A] hover:bg-[#164A4A]/10 rounded-lg transition-colors">
                <Edit2 size={18} />
              </button>
            </div>
            
            <div className="mb-6 flex items-baseline">
              <span className="text-4xl font-black text-[#202828]">₹{plan.price}</span>
              <span className="text-[#455250] ml-2 font-medium">/ {plan.duration.toLowerCase()}</span>
            </div>

            <div className="flex items-center space-x-2 mb-8 bg-[#FFFFFF] p-3 rounded-xl border border-[#D3DFDA]">
              <Users size={18} className="text-[#164A4A]" />
              <span className="text-sm font-semibold text-[#202828]">{plan.subscribers}</span>
              <span className="text-sm text-[#455250]">Active Subscribers</span>
            </div>

            <div className="flex-1">
              <p className="text-sm font-bold text-[#202828] mb-4 uppercase tracking-wider">Features included:</p>
              <ul className="space-y-4">
                {featureList.map((feature: string, idx: number) => (
                  <li key={idx} className="flex items-start">
                    <Check size={18} className="text-green-500 mr-3 shrink-0 mt-0.5" />
                    <span className="text-sm text-[#455250] leading-tight">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-[#D3DFDA]">
              <button onClick={() => handleOpenModal(plan, index)} className="w-full py-3 rounded-xl font-bold transition-colors bg-[#164A4A] text-white hover:bg-[#C6A77D] shadow-lg shadow-[#164A4A]/20">
                Edit Plan
              </button>
            </div>
          </div>
          );
        })}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] w-full max-w-lg rounded-2xl p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6 border-b border-[#D3DFDA] pb-4">
              <h2 className="text-2xl font-bold text-[#202828]">
                {editingIndex !== null ? 'Edit Plan' : 'Create New Plan'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-[#455250] hover:text-[#EF4444] transition-colors">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-[#455250] mb-1">Plan Name</label>
                <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border border-[#D3DFDA] rounded-lg px-4 py-2 outline-none focus:border-[#164A4A]" placeholder="e.g. Pro Tier" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-[#455250] mb-1">Price (₹)</label>
                  <input required type="number" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full border border-[#D3DFDA] rounded-lg px-4 py-2 outline-none focus:border-[#164A4A]" placeholder="49.99" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#455250] mb-1">Duration</label>
                  <select value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} className="w-full border border-[#D3DFDA] rounded-lg px-4 py-2 outline-none focus:border-[#164A4A]">
                    <option value="Monthly">Monthly</option>
                    <option value="Yearly">Yearly</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-[#455250] mb-1">Features (comma separated)</label>
                <textarea required rows={4} value={formData.features} onChange={e => setFormData({...formData, features: e.target.value})} className="w-full border border-[#D3DFDA] rounded-lg px-4 py-2 outline-none focus:border-[#164A4A]" placeholder="Access to gym, 1 PT session, Locker access" />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-[#455250] hover:bg-[#F1F5F9] rounded-lg font-medium transition-colors">
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

export default GymAdminMembershipPlans;
