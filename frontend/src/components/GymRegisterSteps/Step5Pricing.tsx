import React, { useState } from 'react';
import { Plus, Trash2, CheckCircle } from 'lucide-react';

interface StepProps {
  form: any;
  set: (field: string, value: any) => void;
  errors: Record<string, string>;
  inputCls: (field: string) => string;
}

const Step5Pricing: React.FC<StepProps> = ({ form, set, errors, inputCls }) => {
  const [showAddPlan, setShowAddPlan] = useState(false);
  const [newPlan, setNewPlan] = useState({ name: '', price: '', duration: '', features: '' });

  const addPlan = () => {
    if (!newPlan.name || !newPlan.price || !newPlan.duration) {
      alert('Please fill all required plan fields');
      return;
    }
    const plans = form.subscriptionPlans || [];
    set('subscriptionPlans', [...plans, newPlan]);
    setNewPlan({ name: '', price: '', duration: '', features: '' });
    setShowAddPlan(false);
  };

  const removePlan = (index: number) => {
    const updated = [...(form.subscriptionPlans || [])];
    updated.splice(index, 1);
    set('subscriptionPlans', updated);
  };

  const plans = form.subscriptionPlans || [];

  return (
    <div className="space-y-6">
      <div className="border-b border-[#CCFBF1] pb-2 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-[#1E293B]">Membership & Pricing</h2>
          <p className="text-sm text-[#475569]">Define your subscription plans for members.</p>
        </div>
        {!showAddPlan && (
          <button type="button" onClick={() => setShowAddPlan(true)} className="px-3 py-1.5 bg-[#16A34A]/10 text-[#16A34A] text-sm font-medium rounded-lg hover:bg-[#16A34A]/20 transition-colors flex items-center space-x-1">
            <Plus size={16} /><span>Add Plan</span>
          </button>
        )}
      </div>

      {showAddPlan && (
        <div className="bg-[#FFFFFF] border border-[#16A34A]/30 rounded-xl p-5 space-y-4">
          <h3 className="font-medium text-[#1E293B] text-sm">New Membership Plan</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-[#475569] mb-1">Plan Name *</label>
              <input value={newPlan.name} onChange={e => setNewPlan({...newPlan, name: e.target.value})} placeholder="e.g. Monthly Pro" className={inputCls('planName')} />
            </div>
            <div>
              <label className="block text-xs text-[#475569] mb-1">Price *</label>
              <input type="number" value={newPlan.price} onChange={e => setNewPlan({...newPlan, price: e.target.value})} placeholder="e.g. 2999" className={inputCls('planPrice')} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-[#475569] mb-1">Duration *</label>
              <select value={newPlan.duration} onChange={e => setNewPlan({...newPlan, duration: e.target.value})} className={inputCls('planDuration')}>
                <option value="">Select Duration</option>
                <option value="Free Trial">Free Trial</option>
                <option value="1 Month">1 Month</option>
                <option value="3 Months">3 Months</option>
                <option value="6 Months">6 Months</option>
                <option value="1 Year">1 Year</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-[#475569] mb-1">Features (comma separated)</label>
              <input value={newPlan.features} onChange={e => setNewPlan({...newPlan, features: e.target.value})} placeholder="e.g. Cardio, Weights, AC" className={inputCls('planFeatures')} />
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-2">
            <button type="button" onClick={() => setShowAddPlan(false)} className="px-4 py-2 text-sm text-[#475569] hover:text-[#16A34A] transition-colors">Cancel</button>
            <button type="button" onClick={addPlan} className="px-4 py-2 bg-[#16A34A] text-white text-sm font-semibold rounded-lg hover:bg-[#15803D] transition-colors">Save Plan</button>
          </div>
        </div>
      )}

      {errors.subscriptionPlans && <p className="text-teal-400 text-xs">{errors.subscriptionPlans}</p>}

      {plans.length === 0 && !showAddPlan ? (
        <div className="text-center py-8 bg-[#FFFFFF] border border-[#CCFBF1] border-dashed rounded-xl">
          <p className="text-[#475569] text-sm mb-3">No subscription plans added yet.</p>
          <button type="button" onClick={() => setShowAddPlan(true)} className="px-4 py-2 bg-[#FFFFFF] text-[#1E293B] text-sm border border-[#CCFBF1] rounded-lg hover:border-[#16A34A]/50 transition-colors">
            Create First Plan
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {plans.map((plan: any, i: number) => (
            <div key={i} className="bg-[#FFFFFF] border border-[#CCFBF1] p-5 rounded-xl flex flex-col h-full relative group">
              <button type="button" onClick={() => removePlan(i)} className="absolute top-3 right-3 text-[#475569] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                <Trash2 size={16} />
              </button>
              <h3 className="text-lg font-bold text-[#1E293B] mb-1">{plan.name}</h3>
              <div className="text-2xl font-bold text-[#16A34A] mb-4">₹{plan.price} <span className="text-sm font-normal text-[#475569]">/ {plan.duration}</span></div>
              {plan.features && (
                <div className="space-y-2 mt-auto pt-4 border-t border-[#CCFBF1]">
                  {plan.features.split(',').map((f: string, idx: number) => (
                    <div key={idx} className="flex items-center space-x-2 text-xs text-[#475569]">
                      <CheckCircle size={12} className="text-[#16A34A]" />
                      <span>{f.trim()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Step5Pricing;
