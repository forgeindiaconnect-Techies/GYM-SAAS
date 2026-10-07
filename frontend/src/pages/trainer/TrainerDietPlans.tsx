import { useState } from 'react';
import { 
  Utensils, 
  Plus, 
  Leaf, 
  Flame, 
  Droplets, 
  X, 
  Clock, 
  CheckCircle2, 
  UserCheck, 
  Sparkles, 
  Info
} from 'lucide-react';

interface MealItem {
  mealName: string;
  time: string;
  items: string;
  cals: string;
  protein: string;
}

interface DietPlan {
  name: string;
  cals: string;
  p: string;
  c: string;
  f: string;
  type: string;
  description?: string;
  targetGoal?: string;
  hydration?: string;
  meals?: MealItem[];
  guidelines?: string[];
}

const initialPlans: DietPlan[] = [
  { 
    name: 'Lean Muscle Builder', 
    cals: '2800', 
    p: '180g', 
    c: '300g', 
    f: '80g', 
    type: 'High Protein',
    targetGoal: 'Hypertrophy & Lean Mass Gain',
    hydration: '3.5 - 4.0 Liters / day',
    description: 'A scientifically structured high-protein diet engineered for maximum muscle protein synthesis, quick workout recovery, and controlled body fat retention.',
    meals: [
      { mealName: 'Breakfast (8:00 AM)', time: '08:00 AM', items: '6 Egg Whites + 2 Whole Eggs, 100g Rolled Oats with berries, 1 Banana, 10 Almonds', cals: '720 kcal', protein: '45g' },
      { mealName: 'Mid-Morning Snack (11:00 AM)', time: '11:00 AM', items: '1 Scoop Whey Isolate in Skimmed Milk or Water, 1 Apple, 1 tbsp Peanut Butter', cals: '320 kcal', protein: '28g' },
      { mealName: 'Lunch (1:30 PM)', time: '01:30 PM', items: '200g Grilled Chicken Breast / Paneer, 150g Brown Rice, Steamed Broccoli & Asparagus with olive oil', cals: '750 kcal', protein: '55g' },
      { mealName: 'Pre-Workout Fuel (5:00 PM)', time: '05:00 PM', items: '2 Slices Whole Wheat Toast, 1 Banana, 1 cup Espresso / Black Coffee', cals: '280 kcal', protein: '10g' },
      { mealName: 'Post-Workout Dinner (8:30 PM)', time: '08:30 PM', items: '180g Grilled Salmon or Cottage Cheese, 1 Baked Sweet Potato, Large Mixed Green Salad', cals: '650 kcal', protein: '42g' },
      { mealName: 'Bedtime (10:30 PM)', time: '10:30 PM', items: '1 Cup Warm Milk with pinch of Turmeric or 150g Low-fat Greek Yogurt', cals: '120 kcal', protein: '10g' }
    ],
    guidelines: [
      'Drink 500ml of water immediately upon waking up',
      'Take 5g Creatine Monohydrate with your post-workout meal',
      'Maintain consistent meal timings within a 30-minute variance',
      'Prioritize 7-8 hours of sleep for optimum growth hormone release'
    ]
  },
  { 
    name: 'Aggressive Fat Loss', 
    cals: '1800', 
    p: '160g', 
    c: '120g', 
    f: '60g', 
    type: 'Low Carb',
    targetGoal: 'Subcutaneous Fat Shredding & Caloric Deficit',
    hydration: '4.0 Liters / day',
    description: 'Optimized deficit protocol maximizing high thermic effect of protein while moderating carbohydrate intake to accelerate metabolic fat burn without losing lean muscle mass.',
    meals: [
      { mealName: 'Breakfast (8:30 AM)', time: '08:30 AM', items: '4 Egg Whites + 1 Whole Egg Omelette with baby spinach and mushrooms, 1 cup Green Tea', cals: '320 kcal', protein: '30g' },
      { mealName: 'Mid-Day Fuel (12:00 PM)', time: '12:00 PM', items: '150g Boiled Chickpeas or Grilled Tofu salad with lemon dressing, 1 Cucumber', cals: '250 kcal', protein: '18g' },
      { mealName: 'Lunch (2:00 PM)', time: '02:00 PM', items: '180g Grilled Chicken Breast or Soya Chunks, Large Raw Vegetable Salad with 1 tsp Flaxseed oil', cals: '480 kcal', protein: '48g' },
      { mealName: 'Pre-Workout (5:30 PM)', time: '05:30 PM', items: '1 Cup Strong Black Coffee, 8 Soaked Almonds, 1 Rice Cake', cals: '140 kcal', protein: '4g' },
      { mealName: 'Dinner (8:00 PM)', time: '08:00 PM', items: '160g Pan-seared White Fish / Paneer Tikka, Sautéed Bell Peppers & Zucchini in extra virgin olive oil', cals: '450 kcal', protein: '40g' },
      { mealName: 'Night Calmer (10:00 PM)', time: '10:00 PM', items: 'Chamomile Tea or Warm Cinnamon Infused Water', cals: '10 kcal', protein: '0g' }
    ],
    guidelines: [
      'Maintain a 16:8 intermittent fasting window if compatible with routine',
      'Strictly avoid refined sugars, syrups, and sweetened beverages',
      'Increase fibrous leafy greens to maintain satiety throughout the day',
      'Keep sodium intake controlled to avoid unnecessary water retention'
    ]
  },
  { 
    name: 'Maintenance Phase', 
    cals: '2400', 
    p: '150g', 
    c: '250g', 
    f: '75g', 
    type: 'Balanced',
    targetGoal: 'Weight Maintenance & Peak Athletic Energy',
    hydration: '3.0 - 3.5 Liters / day',
    description: 'Equilibrium macronutrient split engineered to sustain current body weight, balance hormonal vitality, and deliver peak energy for high-intensity training sessions.',
    meals: [
      { mealName: 'Breakfast (8:00 AM)', time: '08:00 AM', items: '3 Scrambled Eggs, 2 Slices Multigrain Toast, 1 small cup Greek Yogurt with mixed seeds', cals: '580 kcal', protein: '35g' },
      { mealName: 'Morning Snack (11:30 AM)', time: '11:30 AM', items: '1 Seasonal Fresh Fruit (Apple/Orange), Handful of Walnuts & Roasted Pumpkin Seeds', cals: '220 kcal', protein: '6g' },
      { mealName: 'Lunch (1:30 PM)', time: '01:30 PM', items: '150g Grilled Chicken / Dal & Paneer, 1.5 Cups Basmati or Brown Rice, Steamed Veggies', cals: '680 kcal', protein: '45g' },
      { mealName: 'Evening Snack (5:00 PM)', time: '05:00 PM', items: 'Roasted Makhana (Foxnuts) or Boiled Sprouts Chaat, 1 Scoop Whey Protein', cals: '300 kcal', protein: '28g' },
      { mealName: 'Dinner (8:30 PM)', time: '08:30 PM', items: '150g Grilled Fish or Cottage Cheese with Garlic Herbs, 1 Chapati / Quinoa, Mixed Greens', cals: '520 kcal', protein: '36g' }
    ],
    guidelines: [
      'Monitor body weight once a week (same morning, fasted) to confirm maintenance range within ±1 kg',
      'Include healthy fats (olive oil, nuts, seeds) for optimal joint health',
      'Hydrate with electrolyte-rich water on intense strength & cardio days',
      'Allow 1 flexible / mindful meal per week without exceeding daily caloric equilibrium'
    ]
  },
];

const mockClients = [
  { id: '1', name: 'John Doe', email: 'john@example.com', plan: 'Gold Plan' },
  { id: '2', name: 'Sarah Connor', email: 'sarah@example.com', plan: 'Silver Plan' },
  { id: '3', name: 'Michael Smith', email: 'michael@example.com', plan: 'Free Trial' },
  { id: '4', name: 'Emily Davis', email: 'emily@example.com', plan: 'Gold Plan' }
];

const TrainerDietPlans = () => {
  const [plans, setPlans] = useState<DietPlan[]>(initialPlans);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<DietPlan | null>(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [assignSuccess, setAssignSuccess] = useState('');

  const [form, setForm] = useState({
    name: '',
    cals: '',
    p: '',
    c: '',
    f: '',
    type: 'High Protein',
    targetGoal: '',
    description: ''
  });

  const handleCreatePlan = (e: React.FormEvent) => {
    e.preventDefault();
    const newPlan: DietPlan = {
      name: form.name,
      cals: form.cals,
      p: form.p.endsWith('g') ? form.p : `${form.p}g`,
      c: form.c.endsWith('g') ? form.c : `${form.c}g`,
      f: form.f.endsWith('g') ? form.f : `${form.f}g`,
      type: form.type,
      targetGoal: form.targetGoal || `${form.type} Nutrition Goal`,
      hydration: '3.0 - 4.0 Liters / day',
      description: form.description || `Custom tailored ${form.type.toLowerCase()} diet plan designed with ${form.cals} daily calories.`,
      meals: [
        { mealName: 'Breakfast (8:00 AM)', time: '08:00 AM', items: 'High protein breakfast with whole grains, eggs or plant protein, and seasonal fruits', cals: `${Math.round(Number(form.cals) * 0.28)} kcal`, protein: `${Math.round(Number(form.p.replace(/\D/g, '') || 120) * 0.28)}g` },
        { mealName: 'Mid-Morning Snack (11:30 AM)', time: '11:30 AM', items: 'Protein snack with nuts, seeds, or protein shake', cals: `${Math.round(Number(form.cals) * 0.15)} kcal`, protein: `${Math.round(Number(form.p.replace(/\D/g, '') || 120) * 0.18)}g` },
        { mealName: 'Lunch (1:30 PM)', time: '01:30 PM', items: 'Balanced main meal with lean protein source, complex carbs, and high-fiber vegetables', cals: `${Math.round(Number(form.cals) * 0.32)} kcal`, protein: `${Math.round(Number(form.p.replace(/\D/g, '') || 120) * 0.32)}g` },
        { mealName: 'Dinner (8:00 PM)', time: '08:00 PM', items: 'Light protein-focused meal with sautéed greens and healthy cooking oils', cals: `${Math.round(Number(form.cals) * 0.25)} kcal`, protein: `${Math.round(Number(form.p.replace(/\D/g, '') || 120) * 0.22)}g` }
      ],
      guidelines: [
        'Drink adequate water throughout the day (at least 3.5 Liters)',
        'Maintain high protein intake across all meals',
        'Avoid sugary drinks and refined processed snacks'
      ]
    };

    setPlans([newPlan, ...plans]);
    setIsCreateModalOpen(false);
    setForm({ name: '', cals: '', p: '', c: '', f: '', type: 'High Protein', targetGoal: '', description: '' });
  };

  const handleAssignToClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientId) return;
    const client = mockClients.find(c => c.id === selectedClientId);
    setAssignSuccess(`"${selectedPlan?.name}" successfully assigned to ${client?.name || 'client'}!`);
    setTimeout(() => {
      setAssignSuccess('');
      setAssignModalOpen(false);
    }, 2200);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#292524]">Diet Plans</h1>
          <p className="text-[#78716C]">Manage nutrition guidelines, macro splits, and customized meal plans</p>
        </div>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="px-5 py-2.5 bg-[#F97316] text-white rounded-xl font-bold flex items-center gap-2 hover:bg-[#EA580C] transition-all shadow-md active:scale-95"
        >
          <Plus size={18} /> Create Diet Plan
        </button>
      </div>

      {/* Diet Plan Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan, i) => (
          <div 
            key={i} 
            className="bg-[#FFFFFF] border border-[#E7E5E4] hover:border-[#F97316]/50 transition-all rounded-2xl p-6 shadow-sm hover:shadow-md flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="w-11 h-11 bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-500 font-bold">
                  <Utensils size={22} />
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 bg-[#FFFDF8] border border-[#E7E5E4] rounded-full text-[#78716C]">
                  {plan.type}
                </span>
              </div>
              
              <h3 className="font-bold text-xl text-[#292524] mb-1">{plan.name}</h3>
              {plan.targetGoal && (
                <p className="text-xs text-[#78716C] mb-4">{plan.targetGoal}</p>
              )}
              
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-3xl font-extrabold text-[#F97316]">{plan.cals}</span>
                <span className="text-sm font-medium text-[#78716C]">kcal/day</span>
              </div>

              {/* Macro Breakdown */}
              <div className="grid grid-cols-3 gap-2 border-t border-[#E7E5E4] pt-4">
                <div className="text-center p-2.5 bg-[#F9FAF9] rounded-xl border border-[#E7E5E4]/60">
                  <Leaf size={15} className="mx-auto text-emerald-600 mb-1" />
                  <div className="font-bold text-sm text-[#292524]">{plan.p}</div>
                  <div className="text-[10px] font-semibold text-[#78716C] uppercase tracking-wider">PROTEIN</div>
                </div>
                <div className="text-center p-2.5 bg-[#F9FAF9] rounded-xl border border-[#E7E5E4]/60">
                  <Flame size={15} className="mx-auto text-orange-500 mb-1" />
                  <div className="font-bold text-sm text-[#292524]">{plan.c}</div>
                  <div className="text-[10px] font-semibold text-[#78716C] uppercase tracking-wider">CARBS</div>
                </div>
                <div className="text-center p-2.5 bg-[#F9FAF9] rounded-xl border border-[#E7E5E4]/60">
                  <Droplets size={15} className="mx-auto text-amber-500 mb-1" />
                  <div className="font-bold text-sm text-[#292524]">{plan.f}</div>
                  <div className="text-[10px] font-semibold text-[#78716C] uppercase tracking-wider">FATS</div>
                </div>
              </div>
            </div>
            
            {/* View Details Button */}
            <button 
              onClick={() => setSelectedPlan(plan)}
              className="w-full mt-6 py-2.5 border border-[#E7E5E4] hover:border-[#F97316] hover:bg-[#F97316] hover:text-white text-[#292524] rounded-xl text-sm font-semibold transition-all shadow-sm active:scale-98"
            >
              View Details
            </button>
          </div>
        ))}
      </div>

      {/* ===================== VIEW DETAILS MODAL ===================== */}
      {selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-[#FFFFFF] rounded-2xl max-w-2xl w-full shadow-2xl border border-[#E7E5E4] overflow-hidden my-auto max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-[#E7E5E4] flex justify-between items-center bg-gradient-to-r from-[#F97316] to-[#EA580C] text-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center text-white">
                  <Utensils size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-white">{selectedPlan.name}</h2>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/20 text-white font-medium">
                      {selectedPlan.type}
                    </span>
                  </div>
                  <p className="text-xs text-white/80 mt-0.5">{selectedPlan.targetGoal || 'Comprehensive Nutrition Plan'}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedPlan(null)} 
                className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                title="Close"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Overview & Nutrition Target */}
              <div className="bg-[#FFFDF8] rounded-xl p-4 border border-[#E7E5E4]">
                <div className="flex items-center gap-2 text-sm font-bold text-[#F97316] mb-1.5">
                  <Info size={16} /> Plan Overview
                </div>
                <p className="text-sm text-[#78716C] leading-relaxed">
                  {selectedPlan.description || 'Nutritionally balanced meal regimen designed for performance, stamina, and recovery.'}
                </p>
                {selectedPlan.hydration && (
                  <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg w-fit">
                    <Droplets size={14} /> Recommended Hydration: {selectedPlan.hydration}
                  </div>
                )}
              </div>

              {/* Macro Cards Summary */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#78716C] mb-3">Daily Calorie & Macro Target</h4>
                <div className="grid grid-cols-4 gap-3">
                  <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-center">
                    <span className="text-xs text-teal-800 font-semibold block">Total Energy</span>
                    <span className="text-xl font-black text-[#F97316]">{selectedPlan.cals}</span>
                    <span className="text-[10px] text-teal-700 block">kcal/day</span>
                  </div>
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                    <span className="text-xs text-emerald-800 font-semibold block">Protein</span>
                    <span className="text-xl font-black text-emerald-700">{selectedPlan.p}</span>
                    <span className="text-[10px] text-emerald-600 block">Muscle building</span>
                  </div>
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-center">
                    <span className="text-xs text-amber-800 font-semibold block">Carbohydrates</span>
                    <span className="text-xl font-black text-amber-700">{selectedPlan.c}</span>
                    <span className="text-[10px] text-amber-600 block">Energy source</span>
                  </div>
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-center">
                    <span className="text-xs text-rose-800 font-semibold block">Healthy Fats</span>
                    <span className="text-xl font-black text-rose-700">{selectedPlan.f}</span>
                    <span className="text-[10px] text-rose-600 block">Hormonal balance</span>
                  </div>
                </div>
              </div>

              {/* Meals Schedule Breakdown */}
              {selectedPlan.meals && selectedPlan.meals.length > 0 && (
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#78716C] flex items-center gap-1.5">
                      <Clock size={14} className="text-[#F97316]" /> Daily Meal Breakdown & Schedule
                    </h4>
                    <span className="text-xs text-[#78716C] font-medium">{selectedPlan.meals.length} Meals / Day</span>
                  </div>

                  <div className="space-y-3">
                    {selectedPlan.meals.map((m, idx) => (
                      <div key={idx} className="p-3.5 bg-white border border-[#E7E5E4] rounded-xl hover:border-[#F97316]/40 transition-colors">
                        <div className="flex justify-between items-start gap-2 mb-1.5">
                          <div className="font-bold text-sm text-[#292524] flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-[#F97316]/10 text-[#F97316] text-xs flex items-center justify-center font-bold">
                              {idx + 1}
                            </span>
                            {m.mealName}
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-orange-100 text-orange-800">
                              {m.cals}
                            </span>
                            {m.protein && (
                              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                                {m.protein} Pro
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-[#78716C] pl-7">{m.items}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Guidelines / Recommendations */}
              {selectedPlan.guidelines && selectedPlan.guidelines.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#78716C] mb-3 flex items-center gap-1.5">
                    <Sparkles size={14} className="text-[#F97316]" /> Trainer Guidelines & Tips
                  </h4>
                  <div className="bg-[#FFFDF8] border border-[#E7E5E4] rounded-xl p-4 space-y-2">
                    {selectedPlan.guidelines.map((tip, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-[#78716C]">
                        <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                        <span>{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 sm:p-5 border-t border-[#E7E5E4] bg-[#FFFDF8] flex flex-wrap justify-between items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setAssignModalOpen(true)}
                className="px-4 py-2 bg-[#F97316] hover:bg-[#EA580C] text-white rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-sm active:scale-95"
              >
                <UserCheck size={16} /> Assign to Client
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedPlan(null)}
                  className="px-5 py-2 rounded-xl text-sm font-bold text-[#78716C] hover:bg-[#FED7AA] transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================== ASSIGN TO CLIENT MODAL ===================== */}
      {assignModalOpen && selectedPlan && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-[#E7E5E4] overflow-hidden">
            <div className="p-5 border-b border-[#E7E5E4] flex justify-between items-center bg-[#FFFDF8]">
              <div className="flex items-center gap-2">
                <UserCheck size={20} className="text-[#F97316]" />
                <h3 className="font-bold text-[#292524] text-base">Assign Diet Plan</h3>
              </div>
              <button 
                onClick={() => setAssignModalOpen(false)}
                className="p-1.5 text-[#78716C] hover:text-[#292524] hover:bg-gray-100 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAssignToClient} className="p-5 space-y-4">
              <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-900">
                Assigning <strong>{selectedPlan.name}</strong> ({selectedPlan.cals} kcal/day)
              </div>

              <div>
                <label className="block text-xs font-bold text-[#78716C] uppercase tracking-wider mb-2">
                  Select Gym Member / Client *
                </label>
                <select
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="w-full bg-[#FFFFFF] border border-[#E7E5E4] rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-[#F97316]"
                  required
                >
                  <option value="">-- Choose a member --</option>
                  {mockClients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.name} ({client.email}) — {client.plan}
                    </option>
                  ))}
                </select>
              </div>

              {assignSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 size={16} /> {assignSuccess}
                </div>
              )}

              <div className="pt-3 flex justify-end gap-2 border-t border-[#E7E5E4]">
                <button
                  type="button"
                  onClick={() => setAssignModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#78716C] hover:bg-[#FED7AA]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedClientId}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#F97316] text-white hover:bg-[#EA580C] disabled:opacity-50 transition-colors"
                >
                  Confirm Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== CREATE DIET PLAN MODAL ===================== */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#FFFFFF] rounded-2xl max-w-md w-full shadow-2xl border border-[#E7E5E4] overflow-hidden">
            <div className="p-6 border-b border-[#E7E5E4] flex justify-between items-center bg-[#FFFDF8]">
              <h2 className="text-xl font-bold text-[#292524]">Create Diet Plan</h2>
              <button 
                onClick={() => setIsCreateModalOpen(false)} 
                className="p-2 text-[#78716C] hover:text-[#292524] hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={22} />
              </button>
            </div>
            
            <form onSubmit={handleCreatePlan} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#78716C] mb-1.5">Plan Name *</label>
                <input 
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Lean Muscle Builder"
                  className="w-full bg-[#FFFFFF] border border-[#E7E5E4] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#F97316]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#78716C] mb-1.5">Target Objective / Subtitle</label>
                <input 
                  type="text"
                  value={form.targetGoal}
                  onChange={(e) => setForm({ ...form, targetGoal: e.target.value })}
                  placeholder="e.g. High Protein Hypertrophy"
                  className="w-full bg-[#FFFFFF] border border-[#E7E5E4] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#F97316]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#78716C] mb-1.5">Daily Calories *</label>
                  <input 
                    type="number"
                    value={form.cals}
                    onChange={(e) => setForm({ ...form, cals: e.target.value })}
                    placeholder="e.g. 2400"
                    className="w-full bg-[#FFFFFF] border border-[#E7E5E4] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#F97316]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#78716C] mb-1.5">Plan Type *</label>
                  <select 
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full bg-[#FFFFFF] border border-[#E7E5E4] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#F97316]"
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

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#78716C] mb-1">Protein (g) *</label>
                  <input 
                    type="text"
                    value={form.p}
                    onChange={(e) => setForm({ ...form, p: e.target.value })}
                    placeholder="e.g. 150g"
                    className="w-full bg-[#FFFFFF] border border-[#E7E5E4] rounded-xl px-3 py-2 text-sm outline-none focus:border-[#F97316]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#78716C] mb-1">Carbs (g) *</label>
                  <input 
                    type="text"
                    value={form.c}
                    onChange={(e) => setForm({ ...form, c: e.target.value })}
                    placeholder="e.g. 200g"
                    className="w-full bg-[#FFFFFF] border border-[#E7E5E4] rounded-xl px-3 py-2 text-sm outline-none focus:border-[#F97316]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#78716C] mb-1">Fat (g) *</label>
                  <input 
                    type="text"
                    value={form.f}
                    onChange={(e) => setForm({ ...form, f: e.target.value })}
                    placeholder="e.g. 60g"
                    className="w-full bg-[#FFFFFF] border border-[#E7E5E4] rounded-xl px-3 py-2 text-sm outline-none focus:border-[#F97316]"
                    required
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-[#E7E5E4]">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl font-bold text-[#78716C] hover:bg-[#FED7AA] transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl font-bold bg-[#F97316] text-white hover:bg-[#EA580C] transition-colors text-sm"
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