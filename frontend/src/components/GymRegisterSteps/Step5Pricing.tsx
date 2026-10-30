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
      <div className="border-b border-[#E7DADD] pb-2 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-[#292524]">Membership & Pricing</h2>
          <p className="text-sm text-[#57534E]">Define your package plans for members.</p>
        </div>
        {!showAddPlan && (
          <button type="button" onClick={() => setShowAddPlan(true)} className="px-3.5 py-1.5 bg-[#B76E79] text-white text-sm font-bold rounded-lg hover:bg-[#9F5965] transition-colors flex items-center space-x-1 shadow-xs cursor-pointer">
            <Plus size={16} /><span>Add Package Plan</span>
          </button>
        )}
      </div>

      {showAddPlan && (
        <div className="bg-[#F3E8E8] border border-[#E7DADD] rounded-xl p-5 space-y-4">
          <h3 className="font-bold text-[#292524] text-sm">New Package Plan</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#292524] mb-1">Package Name *</label>
              <input value={newPlan.name} onChange={e => setNewPlan({...newPlan, name: e.target.value})} placeholder="e.g. Monthly Pro" className={inputCls('planName')} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#292524] mb-1">Price *</label>
              <input type="number" value={newPlan.price} onChange={e => setNewPlan({...newPlan, price: e.target.value})} placeholder="e.g. 2999" className={inputCls('planPrice')} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#292524] mb-1">Duration *</label>
              <select value={newPlan.duration} onChange={e => setNewPlan({...newPlan, duration: e.target.value})} className={inputCls('planDuration')}>
                <option value="">Select Duration</option>
                <option value="1 Day">1 Day</option>
                <option value="1 Month">1 Month</option>
                <option value="3 Months">3 Months</option>
                <option value="6 Months">6 Months</option>
                <option value="1 Year">1 Year</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#292524] mb-1">Features (comma separated)</label>
              <input value={newPlan.features} onChange={e => setNewPlan({...newPlan, features: e.target.value})} placeholder="e.g. Cardio, Weights, AC" className={inputCls('planFeatures')} />
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-2">
            <button type="button" onClick={() => setShowAddPlan(false)} className="px-4 py-2 text-sm text-[#57534E] hover:text-[#292524] transition-colors font-medium cursor-pointer">Cancel</button>
            <button type="button" onClick={addPlan} className="px-4 py-2 bg-[#B76E79] text-white font-bold text-sm rounded-lg hover:bg-[#9F5965] transition-colors shadow-xs cursor-pointer">Save Plan</button>
          </div>
        </div>
      )}

      {errors.subscriptionPlans && <p className="text-red-400 text-xs font-medium">{errors.subscriptionPlans}</p>}

      {plans.length === 0 && !showAddPlan ? (
        <div className="text-center py-8 bg-[#F3E8E8] border border-[#E7DADD] border-dashed rounded-xl">
          <p className="text-[#57534E] text-sm mb-3">No package plans added yet.</p>
          <button type="button" onClick={() => setShowAddPlan(true)} className="px-4 py-2 bg-[#FFFFFF] text-[#292524] text-sm font-semibold border border-[#E7DADD] rounded-lg hover:border-[#B76E79] transition-colors shadow-xs cursor-pointer">
            Create First Package Plan
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {plans.map((plan: any, i: number) => (
            <div key={i} className="bg-[#FFFFFF] border border-[#E7DADD] p-5 rounded-xl flex flex-col h-full relative group shadow-xs">
              <button type="button" onClick={() => removePlan(i)} className="absolute top-3 right-3 text-[#57534E] hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <Trash2 size={16} />
              </button>
              <h3 className="text-lg font-bold text-[#292524] mb-1">{plan.name}</h3>
              <div className="text-2xl font-extrabold text-[#B76E79] mb-4">₹{plan.price} <span className="text-sm font-normal text-[#57534E]">/ {plan.duration}</span></div>
              {plan.features && (
                <div className="space-y-2 mt-auto pt-4 border-t border-[#E7DADD]">
                  {plan.features.split(',').map((f: string, idx: number) => (
                    <div key={idx} className="flex items-center space-x-2 text-xs font-medium text-[#292524]">
                      <CheckCircle size={12} className="text-[#B76E79]" />
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
