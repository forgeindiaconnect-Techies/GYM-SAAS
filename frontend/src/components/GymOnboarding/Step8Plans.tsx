import { useState } from 'react';
import { CreditCard, Plus, X } from 'lucide-react';

export const Step8Plans = ({ data, updateData }: any) => {
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState({
    planName: '', duration: '1 Month', price: '', discount: '0', category: 'Standard', features: ''
  });

  const handleAdd = () => {
    if (!form.planName || !form.price || !form.duration) {
      alert("Plan Name, Duration, and Price are required.");
      return;
    }
    const finalPrice = parseFloat(form.price) - (parseFloat(form.discount) || 0);
    updateData({ 
      plans: [...data.plans, { ...form, finalPrice, id: Date.now().toString(), featuresList: form.features.split(',').map(f => f.trim()).filter(Boolean) }] 
    });
    setForm({ planName: '', duration: '1 Month', price: '', discount: '0', category: 'Standard', features: '' });
    setIsAdding(false);
  };

  const removePlan = (id: string) => {
    updateData({ plans: data.plans.filter((p: any) => p.id !== id) });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#DCD9CD]">
        <div className="flex items-center space-x-3">
          <CreditCard className="text-[#34483F]" size={24} />
          <h2 className="text-xl font-bold">Subscription Plans</h2>
        </div>
        {!isAdding && (
          <button onClick={() => setIsAdding(true)} className="px-4 py-2 bg-[#34483F] text-white rounded-xl font-bold flex items-center space-x-2 text-sm">
            <Plus size={16} /><span>Create Plan</span>
          </button>
        )}
      </div>

      {data.plans.length === 0 && !isAdding && (
        <div className="text-center py-12 border-2 border-dashed border-[#DCD9CD] rounded-2xl">
          <CreditCard className="text-[#4A514D] mx-auto mb-3" size={40} />
          <p className="text-[#4A514D]">No subscription plans created yet.</p>
          <button onClick={() => setIsAdding(true)} className="mt-4 text-[#34483F] font-semibold hover:underline">Create your first plan</button>
        </div>
      )}

      {data.plans.length > 0 && !isAdding && (
        <div className="grid md:grid-cols-2 gap-4">
          {data.plans.map((p: any) => (
            <div key={p.id} className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#DCD9CD] flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-[#202522] font-bold text-lg">{p.planName}</h4>
                  <button onClick={() => removePlan(p.id)} className="text-[#4A514D] hover:text-[#8FA89B] transition-colors">
                    <X size={18} />
                  </button>
                </div>
                <div className="text-[#EF4444] font-bold text-xl mb-4">
                  ₹{p.finalPrice} <span className="text-sm font-normal text-[#4A514D]">/ {p.duration}</span>
                </div>
                <ul className="space-y-1">
                  {p.featuresList.map((f: string, i: number) => (
                    <li key={i} className="text-xs text-[#4A514D] flex items-center before:content-['•'] before:mr-2 before:text-[#34483F]">{f}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}

      {isAdding && (
        <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#DCD9CD]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg">Create Subscription Plan</h3>
            <button onClick={() => setIsAdding(false)} className="text-[#4A514D] hover:text-[#202522]"><X size={20} /></button>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-[#4A514D] mb-1">Plan Name *</label>
              <input type="text" value={form.planName} onChange={e => setForm({...form, planName: e.target.value})} className="w-full bg-[#FFFFFF] border border-[#DCD9CD] rounded-xl px-3 py-2 text-sm text-[#202522] focus:border-[#34483F] outline-none" placeholder="e.g. Elite Membership" />
            </div>
            <div>
              <label className="block text-xs text-[#4A514D] mb-1">Duration *</label>
              <select value={form.duration} onChange={e => setForm({...form, duration: e.target.value})} className="w-full bg-[#FFFFFF] border border-[#DCD9CD] rounded-xl px-3 py-2 text-sm text-[#202522] focus:border-[#34483F] outline-none appearance-none">
                <option value="1 Month">1 Month</option>
                <option value="3 Months">3 Months</option>
                <option value="6 Months">6 Months</option>
                <option value="12 Months">12 Months</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-[#4A514D] mb-1">Price (₹) *</label>
              <input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="w-full bg-[#FFFFFF] border border-[#DCD9CD] rounded-xl px-3 py-2 text-sm text-[#202522] focus:border-[#34483F] outline-none" />
            </div>
            <div>
              <label className="block text-xs text-[#4A514D] mb-1">Discount (₹)</label>
              <input type="number" value={form.discount} onChange={e => setForm({...form, discount: e.target.value})} className="w-full bg-[#FFFFFF] border border-[#DCD9CD] rounded-xl px-3 py-2 text-sm text-[#202522] focus:border-[#34483F] outline-none" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs text-[#4A514D] mb-1">Features (Comma separated)</label>
              <textarea rows={2} value={form.features} onChange={e => setForm({...form, features: e.target.value})} className="w-full bg-[#FFFFFF] border border-[#DCD9CD] rounded-xl px-3 py-2 text-sm text-[#202522] focus:border-[#34483F] outline-none resize-none" placeholder="Gym Access, Free Diet Plan, Personal Trainer..." />
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <button onClick={() => setIsAdding(false)} className="px-4 py-2 text-[#4A514D] hover:text-[#34483F] text-sm">Cancel</button>
            <button onClick={handleAdd} className="px-6 py-2 bg-[#34483F] text-white rounded-xl font-bold text-sm">Create Plan</button>
          </div>
        </div>
      )}
    </div>
  );
};
