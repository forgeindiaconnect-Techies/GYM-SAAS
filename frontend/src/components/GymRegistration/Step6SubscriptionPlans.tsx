import { useState } from 'react';
import { Plus, X, CheckCircle2, Edit2, Copy, Trash2, IndianRupee } from 'lucide-react';

export const Step6SubscriptionPlans = ({ data, updateData }: any) => {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const defaultForm = {
    planName: '', description: '', duration: 1, durationUnit: 'Months',
    price: 0, registrationFee: 0, discount: 0, finalPrice: 0,
    accessType: 'Full Gym Access', personalTrainerIncluded: false,
    groupClassesIncluded: false, dietPlanIncluded: false, workoutPlanIncluded: false,
    facilityAccessIncluded: false, freezeAllowed: false, freezeDuration: 0,
    maxVisitsPerDay: 'Unlimited', status: 'Active'
  };

  const [form, setForm] = useState<any>(defaultForm);

  // Auto-calculate final price
  const updateForm = (fields: any) => {
    setForm((prev: any) => {
      const updated = { ...prev, ...fields };
      const basePrice = parseInt(updated.price) || 0;
      const regFee = parseInt(updated.registrationFee) || 0;
      const discount = parseInt(updated.discount) || 0;
      updated.finalPrice = basePrice + regFee - discount;
      return updated;
    });
  };

  const savePlan = () => {
    if (!form.planName || form.price < 0 || form.duration <= 0) return alert('Please check required fields (Name, Price > 0, Duration > 0)');
    
    let updatedPlans;
    if (editingId) {
      updatedPlans = data.plans.map((p: any) => p.id === editingId ? { ...form, id: editingId } : p);
    } else {
      updatedPlans = [...data.plans, { ...form, id: Date.now().toString() }];
    }
    
    updateData({ plans: updatedPlans });
    setForm(defaultForm);
    setShowForm(false);
    setEditingId(null);
  };

  const editPlan = (plan: any) => {
    setForm(plan);
    setEditingId(plan.id);
    setShowForm(true);
  };

  const duplicatePlan = (plan: any) => {
    const duplicate = { ...plan, id: Date.now().toString(), planName: `${plan.planName} (Copy)` };
    updateData({ plans: [...data.plans, duplicate] });
  };

  const deletePlan = (id: string) => {
    if (window.confirm("Are you sure you want to delete this plan?")) {
      updateData({ plans: data.plans.filter((p: any) => p.id !== id) });
    }
  };

  const toggleStatus = (id: string) => {
    updateData({ plans: data.plans.map((p: any) => p.id === id ? { ...p, status: p.status === 'Active' ? 'Inactive' : 'Active' } : p) });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end border-b border-[#D3DFDA] pb-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#202828] flex items-center gap-2">6. Subscription Plans</h2>
          <p className="text-[#455250] text-sm mt-1">Configure pricing and membership packages.</p>
        </div>
        {!showForm && (
          <button type="button" onClick={() => { setForm(defaultForm); setEditingId(null); setShowForm(true); }} className="flex items-center gap-2 px-4 py-2 bg-[#6fa3a0] hover:bg-teal-600 text-[#202828] font-bold rounded-xl transition-colors">
            <Plus size={18} /> Add Plan
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-[#FFFFFF] border border-[#D3DFDA] rounded-2xl p-6 shadow-xl mb-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-[#202828]">{editingId ? 'Edit Plan' : 'Create New Plan'}</h3>
            <button type="button" onClick={() => setShowForm(false)} className="text-[#455250] hover:text-[#202828]"><X size={20} /></button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[#455250] mb-1">Plan Name *</label>
                <input type="text" value={form.planName} onChange={e => updateForm({ planName: e.target.value })} className="w-full bg-[#FFFFFF] border border-[#D3DFDA] rounded-xl px-4 py-2 text-[#202828] outline-none focus:border-[#164A4A]" placeholder="e.g. Basic Monthly" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[#455250] mb-1">Duration *</label>
                  <input type="number" min="1" value={form.duration} onChange={e => updateForm({ duration: parseInt(e.target.value) || 1 })} className="w-full bg-[#FFFFFF] border border-[#D3DFDA] rounded-xl px-4 py-2 text-[#202828] outline-none focus:border-[#164A4A]" />
                </div>
                <div>
                  <label className="block text-sm text-[#455250] mb-1">Unit</label>
                  <select value={form.durationUnit} onChange={e => updateForm({ durationUnit: e.target.value })} className="w-full bg-[#FFFFFF] border border-[#D3DFDA] rounded-xl px-4 py-2 text-[#202828] outline-none focus:border-[#164A4A]">
                    <option>Days</option><option>Months</option><option>Years</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm text-[#455250] mb-1">Description</label>
                <textarea rows={2} value={form.description} onChange={e => updateForm({ description: e.target.value })} className="w-full bg-[#FFFFFF] border border-[#D3DFDA] rounded-xl px-4 py-2 text-[#202828] outline-none focus:border-[#164A4A] resize-none" placeholder="Features included..." />
              </div>
            </div>

            {/* Pricing Info */}
            <div className="bg-[#FFFFFF] p-4 rounded-xl border border-[#D3DFDA] space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[#455250] mb-1">Base Price *</label>
                  <input type="number" min="0" value={form.price} onChange={e => updateForm({ price: parseInt(e.target.value) || 0 })} className="w-full bg-[#FFFFFF] border border-[#D3DFDA] rounded-xl px-4 py-2 text-[#202828] outline-none focus:border-[#164A4A]" />
                </div>
                <div>
                  <label className="block text-sm text-[#455250] mb-1">Reg. Fee</label>
                  <input type="number" min="0" value={form.registrationFee} onChange={e => updateForm({ registrationFee: parseInt(e.target.value) || 0 })} className="w-full bg-[#FFFFFF] border border-[#D3DFDA] rounded-xl px-4 py-2 text-[#202828] outline-none focus:border-[#164A4A]" />
                </div>
              </div>
              <div>
                <label className="block text-sm text-[#455250] mb-1">Discount Amount</label>
                <input type="number" min="0" value={form.discount} onChange={e => updateForm({ discount: parseInt(e.target.value) || 0 })} className="w-full bg-[#FFFFFF] border border-[#D3DFDA] rounded-xl px-4 py-2 text-[#202828] outline-none focus:border-[#164A4A]" />
              </div>
              <div className="pt-2 border-t border-[#D3DFDA] flex justify-between items-center">
                <span className="text-[#202828] font-bold">Final Price:</span>
                <span className="text-2xl font-bold text-green-500 flex items-center"><IndianRupee size={20}/> {form.finalPrice}</span>
              </div>
            </div>

            {/* Features Info */}
            <div className="md:col-span-2 grid md:grid-cols-3 gap-x-6 gap-y-4 pt-4 border-t border-[#D3DFDA]">
              <div>
                <label className="block text-sm text-[#455250] mb-1">Access Type</label>
                <select value={form.accessType} onChange={e => updateForm({ accessType: e.target.value })} className="w-full bg-[#FFFFFF] border border-[#D3DFDA] rounded-xl px-3 py-2 text-sm text-[#202828] outline-none">
                  <option>Full Gym Access</option><option>Limited Access</option><option>Time Based Access</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-[#455250] mb-1">Max Visits Per Day</label>
                <select value={form.maxVisitsPerDay} onChange={e => updateForm({ maxVisitsPerDay: e.target.value })} className="w-full bg-[#FFFFFF] border border-[#D3DFDA] rounded-xl px-3 py-2 text-sm text-[#202828] outline-none">
                  <option>Unlimited</option><option>1 Visit</option><option>2 Visits</option>
                </select>
              </div>

              {/* Toggles */}
              {[
                { key: 'personalTrainerIncluded', label: 'Personal Trainer' },
                { key: 'groupClassesIncluded', label: 'Group Classes' },
                { key: 'dietPlanIncluded', label: 'Diet Plan' },
                { key: 'workoutPlanIncluded', label: 'Workout Plan' },
                { key: 'facilityAccessIncluded', label: 'Special Facilities' },
                { key: 'freezeAllowed', label: 'Freeze Membership' }
              ].map(toggle => (
                <div key={toggle.key} className="flex items-center justify-between bg-[#FFFFFF] p-3 rounded-xl border border-[#D3DFDA]">
                  <span className="text-sm text-[#202828]">{toggle.label}</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={form[toggle.key]} onChange={e => updateForm({ [toggle.key]: e.target.checked })} />
                    <div className="w-9 h-5 bg-[#E8E5DA] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#6fa3a0]"></div>
                  </label>
                </div>
              ))}

              {form.freezeAllowed && (
                <div className="col-span-full bg-[#FFFFFF] p-3 rounded-xl border border-[#D3DFDA] flex items-center justify-between">
                  <span className="text-sm text-[#202828]">Freeze Duration (Days)</span>
                  <input type="number" min="1" value={form.freezeDuration} onChange={e => updateForm({ freezeDuration: parseInt(e.target.value) || 0 })} className="w-24 bg-[#FFFFFF] border border-[#D3DFDA] rounded-lg px-2 py-1 text-[#202828] outline-none text-right" />
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-4 border-t border-[#D3DFDA] pt-4">
            <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2 text-[#455250] hover:text-[#164A4A] font-medium transition-colors">Cancel</button>
            <button type="button" onClick={savePlan} className="px-6 py-2 bg-[#6fa3a0] text-white rounded-xl font-bold hover:bg-teal-600 shadow-lg shadow-amber-500/20">Save Plan</button>
          </div>
        </div>
      )}

      {/* Plan Cards Display */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.plans?.map((plan: any) => (
          <div key={plan.id} className={`flex flex-col bg-[#FFFFFF] border ${plan.status === 'Active' ? 'border-[#D3DFDA]' : 'border-[#6fa3a0]/50 opacity-70'} rounded-2xl overflow-hidden`}>
            <div className="p-6 flex-1">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-black text-[#202828] uppercase tracking-wider">{plan.planName}</h3>
                <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full ${plan.status === 'Active' ? 'bg-green-500/20 text-green-500' : 'bg-[#6fa3a0]/20 text-[#6fa3a0]'}`}>
                  {plan.status}
                </span>
              </div>
              <div className="mb-4">
                <span className="text-3xl font-black text-[#202828] flex items-center"><IndianRupee size={24}/>{plan.finalPrice}</span>
                <span className="text-sm text-[#455250]">/ {plan.duration} {plan.durationUnit}</span>
              </div>
              {plan.description && <p className="text-sm text-[#455250] mb-4">{plan.description}</p>}
              
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2 text-[#202828]"><CheckCircle2 size={16} className="text-green-500"/> {plan.accessType}</li>
                <li className={`flex items-center gap-2 ${plan.personalTrainerIncluded ? 'text-[#202828]' : 'text-[#455250]'}`}>
                  {plan.personalTrainerIncluded ? <CheckCircle2 size={16} className="text-green-500"/> : <X size={16} className="text-[#6fa3a0]"/>} Personal Trainer
                </li>
                <li className={`flex items-center gap-2 ${plan.dietPlanIncluded ? 'text-[#202828]' : 'text-[#455250]'}`}>
                  {plan.dietPlanIncluded ? <CheckCircle2 size={16} className="text-green-500"/> : <X size={16} className="text-[#6fa3a0]"/>} Diet Plan
                </li>
                <li className={`flex items-center gap-2 ${plan.groupClassesIncluded ? 'text-[#202828]' : 'text-[#455250]'}`}>
                  {plan.groupClassesIncluded ? <CheckCircle2 size={16} className="text-green-500"/> : <X size={16} className="text-[#6fa3a0]"/>} Group Classes
                </li>
              </ul>
            </div>
            <div className="bg-[#FFFFFF] p-4 flex justify-between border-t border-[#D3DFDA]">
              <div className="flex gap-2">
                <button type="button" onClick={() => editPlan(plan)} className="p-2 text-[#455250] hover:text-[#164A4A] bg-[#E8E5DA] hover:bg-[#333] rounded-lg transition-colors"><Edit2 size={16}/></button>
                <button type="button" onClick={() => duplicatePlan(plan)} className="p-2 text-[#455250] hover:text-blue-400 bg-[#E8E5DA] hover:bg-[#333] rounded-lg transition-colors"><Copy size={16}/></button>
                <button type="button" onClick={() => deletePlan(plan.id)} className="p-2 text-[#455250] hover:text-[#6fa3a0] bg-[#E8E5DA] hover:bg-[#333] rounded-lg transition-colors"><Trash2 size={16}/></button>
              </div>
              <button type="button" onClick={() => toggleStatus(plan.id)} className={`text-xs font-bold px-3 py-1 rounded-lg transition-colors ${plan.status === 'Active' ? 'text-[#6fa3a0] hover:bg-[#6fa3a0]/10' : 'text-green-500 hover:bg-green-500/10'}`}>
                {plan.status === 'Active' ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          </div>
        ))}
        {(!data.plans || data.plans.length === 0) && !showForm && (
          <div className="col-span-full text-center py-12 border-2 border-dashed border-[#D3DFDA] rounded-2xl bg-[#FFFFFF]">
            <p className="text-[#455250] mb-4">No subscription plans created yet.</p>
            <button type="button" onClick={() => setShowForm(true)} className="px-6 py-2 bg-[#FFFFFF] hover:bg-[#E8E5DA] text-[#202828] font-bold rounded-xl transition-colors inline-flex items-center gap-2">
              <Plus size={18} /> Add Your First Plan
            </button>
          </div>
        )}
      </div>
    </div>
  );
};