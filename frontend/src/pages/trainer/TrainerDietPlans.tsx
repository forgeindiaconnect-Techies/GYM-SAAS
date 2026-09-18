import { useState } from 'react';
import { Utensils, Plus, Leaf, Flame, Droplets, X } from 'lucide-react';

const initialPlans = [
  { name: 'Lean Muscle Builder', cals: '2800', p: '180g', c: '300g', f: '80g', type: 'High Protein' },
  { name: 'Aggressive Fat Loss', cals: '1800', p: '160g', c: '120g', f: '60g', type: 'Low Carb' },
  { name: 'Maintenance Phase', cals: '2400', p: '150g', c: '250g', f: '75g', type: 'Balanced' },
];

const TrainerDietPlans = () => {
  const [plans, setPlans] = useState(initialPlans);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [form, setForm] = useState({
    name: '',
    cals: '',
    p: '',
    c: '',
    f: '',
    type: 'High Protein'
  });

  const handleCreatePlan = (e: React.FormEvent) => {
    e.preventDefault();
    setPlans([{ ...form }, ...plans]);
    setIsCreateModalOpen(false);
    setForm({ name: '', cals: '', p: '', c: '', f: '', type: 'High Protein' });
  };
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold">Diet Plans</h1>
          <p className="text-[#475569]">Manage meal plans and nutrition guides</p>
        </div>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 bg-[#16A34A] text-white rounded-xl font-bold flex items-center gap-2 hover:bg-[#15803D] transition-colors"
        >
          <Plus size={18} /> Create Diet Plan
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan, i) => (
          <div key={i} className="bg-[#FFFFFF] border border-[#CCFBF1] rounded-2xl p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-500">
                <Utensils size={20} />
              </div>
              <span className="text-xs px-2 py-1 border border-[#CCFBF1] rounded-full text-[#475569]">{plan.type}</span>
            </div>
            
            <h3 className="font-bold text-xl mb-4">{plan.name}</h3>
            
            <div className="flex items-end gap-2 mb-6">
              <span className="text-3xl font-bold text-[#16A34A]">{plan.cals}</span>
              <span className="text-sm text-[#475569] mb-1">kcal/day</span>
            </div>

            <div className="grid grid-cols-3 gap-2 border-t border-[#CCFBF1] pt-4">
               <div className="text-center p-2 bg-[#FFFFFF] rounded-lg border border-[#CCFBF1]">
                 <Leaf size={14} className="mx-auto text-green-500 mb-1" />
                 <div className="font-bold text-sm">{plan.p}</div>
                 <div className="text-[10px] text-[#475569]">PRO</div>
               </div>
               <div className="text-center p-2 bg-[#FFFFFF] rounded-lg border border-[#CCFBF1]">
                 <Flame size={14} className="mx-auto text-orange-500 mb-1" />
                 <div className="font-bold text-sm">{plan.c}</div>
                 <div className="text-[10px] text-[#475569]">CARB</div>
               </div>
               <div className="text-center p-2 bg-[#FFFFFF] rounded-lg border border-[#CCFBF1]">
                 <Droplets size={14} className="mx-auto text-yellow-500 mb-1" />
                 <div className="font-bold text-sm">{plan.f}</div>
                 <div className="text-[10px] text-[#475569]">FAT</div>
               </div>
            </div>
            
            <button className="w-full mt-6 py-2 border border-[#CCFBF1] hover:bg-[#E2E8F0] text-[#1E293B] rounded-xl text-sm font-medium transition-colors">
              View Details
            </button>
          </div>
        ))}
      </div>

      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#FFFFFF] rounded-2xl max-w-md w-full shadow-2xl border border-[#CCFBF1] overflow-hidden">
            <div className="p-6 border-b border-[#CCFBF1] flex justify-between items-center bg-[#F8FAFC]">
              <h2 className="text-xl font-bold text-[#1E293B]">Create Diet Plan</h2>
              <button 
                onClick={() => setIsCreateModalOpen(false)} 
                className="p-2 text-[#475569] hover:text-[#1E293B] hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={22} />
              </button>
            </div>
            
            <form onSubmit={handleCreatePlan} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-[#475569] mb-2">Plan Name *</label>
                <input 
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Lean Muscle Builder"
                  className="w-full bg-[#FFFFFF] border border-[#CCFBF1] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#16A34A]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#475569] mb-2">Daily Calories *</label>
                  <input 
                    type="number"
                    value={form.cals}
                    onChange={(e) => setForm({ ...form, cals: e.target.value })}
                    placeholder="e.g. 2400"
                    className="w-full bg-[#FFFFFF] border border-[#CCFBF1] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#16A34A]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#475569] mb-2">Plan Type *</label>
                  <select 
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full bg-[#FFFFFF] border border-[#CCFBF1] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#16A34A]"
                    required
                  >
                    <option value="High Protein">High Protein</option>
                    <option value="Low Carb">Low Carb</option>
                    <option value="Balanced">Balanced</option>
                    <option value="Keto">Keto</option>
                    <option value="Vegan">Vegan</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#475569] mb-2">Protein *</label>
                  <input 
                    type="text"
                    value={form.p}
                    onChange={(e) => setForm({ ...form, p: e.target.value })}
                    placeholder="e.g. 150g"
                    className="w-full bg-[#FFFFFF] border border-[#CCFBF1] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#16A34A]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#475569] mb-2">Carbs *</label>
                  <input 
                    type="text"
                    value={form.c}
                    onChange={(e) => setForm({ ...form, c: e.target.value })}
                    placeholder="e.g. 200g"
                    className="w-full bg-[#FFFFFF] border border-[#CCFBF1] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#16A34A]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#475569] mb-2">Fat *</label>
                  <input 
                    type="text"
                    value={form.f}
                    onChange={(e) => setForm({ ...form, f: e.target.value })}
                    placeholder="e.g. 60g"
                    className="w-full bg-[#FFFFFF] border border-[#CCFBF1] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#16A34A]"
                    required
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-[#CCFBF1]">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl font-bold text-[#475569] hover:bg-[#E2E8F0] transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl font-bold bg-[#16A34A] text-white hover:bg-[#15803D] transition-colors text-sm"
                >
                  Create Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainerDietPlans;