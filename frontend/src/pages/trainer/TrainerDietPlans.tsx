import { Utensils, Plus, Leaf, Flame, Droplets } from 'lucide-react';

const TrainerDietPlans = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold">Diet Plans</h1>
          <p className="text-[#475569]">Manage meal plans and nutrition guides</p>
        </div>
        <button className="px-4 py-2 bg-[#16A34A] text-white rounded-xl font-bold flex items-center gap-2">
          <Plus size={18} /> Create Diet Plan
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { name: 'Lean Muscle Builder', cals: '2800', p: '180g', c: '300g', f: '80g', type: 'High Protein' },
          { name: 'Aggressive Fat Loss', cals: '1800', p: '160g', c: '120g', f: '60g', type: 'Low Carb' },
          { name: 'Maintenance Phase', cals: '2400', p: '150g', c: '250g', f: '75g', type: 'Balanced' },
        ].map((plan, i) => (
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
            
            <button className="w-full mt-6 py-2 border border-[#CCFBF1] hover:bg-[#E2E8F0] text-white rounded-xl text-sm transition-colors">
              View Details
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrainerDietPlans;