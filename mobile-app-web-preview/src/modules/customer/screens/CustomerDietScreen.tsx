import React, { useState } from 'react';
import { Apple, Flame, Plus, Droplets, PieChart, ChevronRight } from 'lucide-react';
import { MobileCard } from '../../../shared/components/MobileCard';

export const CustomerDietScreen: React.FC = () => {
  const [meals, setMeals] = useState([
    { id: '1', title: 'Breakfast', time: '08:30 AM', calories: 450, items: '4 Boiled Eggs, Oats with Almond Milk, Banana' },
    { id: '2', title: 'Lunch', time: '01:30 PM', calories: 650, items: 'Grilled Chicken Breast, Brown Rice, Mixed Greens' },
    { id: '3', title: 'Pre-Workout Snack', time: '05:00 PM', calories: 250, items: 'Whey Protein Shake with 1 Apple' },
    { id: '4', title: 'Dinner', time: '08:30 PM', calories: 520, items: 'Paneer Tikka, Quinoa Salad, Steamed Broccoli' }
  ]);

  return (
    <div className="space-y-4 pb-6">
      {/* Macronutrient Card */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-md">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Daily Nutrition Target</span>
          <span className="text-orange-400 font-bold">1,870 / 2,400 kcal</span>
        </div>
        <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden mt-2">
          <div className="bg-orange-500 h-full rounded-full" style={{ width: '78%' }}></div>
        </div>

        {/* Macro split pills */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-800 text-center text-xs">
          <div className="p-2 bg-slate-800/80 rounded-xl">
            <span className="text-[10px] text-slate-400 block">Protein</span>
            <span className="font-bold text-orange-400 text-xs">142g / 160g</span>
          </div>
          <div className="p-2 bg-slate-800/80 rounded-xl">
            <span className="text-[10px] text-slate-400 block">Carbs</span>
            <span className="font-bold text-amber-400 text-xs">195g / 250g</span>
          </div>
          <div className="p-2 bg-slate-800/80 rounded-xl">
            <span className="text-[10px] text-slate-400 block">Fats</span>
            <span className="font-bold text-sky-400 text-xs">48g / 65g</span>
          </div>
        </div>
      </div>

      {/* Meals Log */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold text-slate-900">Logged Meals</h3>
          <button 
            onClick={() => alert('Add meal logged')}
            className="text-xs font-bold text-orange-600 flex items-center gap-1 hover:underline"
          >
            <Plus className="w-3.5 h-3.5" /> Log Meal
          </button>
        </div>

        <div className="space-y-2.5">
          {meals.map(m => (
            <MobileCard key={m.id} className="p-3.5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{m.title}</h4>
                  <p className="text-[10px] text-slate-400">{m.time}</p>
                </div>
                <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200/60">
                  {m.calories} kcal
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-2 pt-2 border-t border-slate-100 font-medium">
                {m.items}
              </p>
            </MobileCard>
          ))}
        </div>
      </div>
    </div>
  );
};
export default CustomerDietScreen;

