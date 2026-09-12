import { Utensils, Droplets, Flame, Coffee, Info } from 'lucide-react';

const MemberDiet = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Diet & Nutrition</h1>
        <p className="text-[#475569]">Your personalized meal plan</p>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        {[
          { label: 'Calories', value: '2,100', target: '2,400', unit: 'kcal', icon: Flame, color: 'text-orange-500', bg: 'bg-orange-500/10' },
          { label: 'Protein', value: '140', target: '160', unit: 'g', icon: Utensils, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Carbs', value: '200', target: '250', unit: 'g', icon: Utensils, color: 'text-green-500', bg: 'bg-green-500/10' },
          { label: 'Fat', value: '50', target: '70', unit: 'g', icon: Droplets, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
        ].map((macro, i) => (
          <div key={i} className="bg-[#FFFFFF] border border-[#CCFBF1] rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-lg ${macro.bg} ${macro.color}`}>
                <macro.icon size={18} />
              </div>
              <span className="font-medium text-[#475569]">{macro.label}</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold">{macro.value}</span>
              <span className="text-[#475569]">/ {macro.target}{macro.unit}</span>
            </div>
            <div className="mt-3 w-full bg-[#E2E8F0] h-1.5 rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${macro.color.replace('text-', 'bg-')}`} style={{ width: `${(parseInt(macro.value.replace(',','')) / parseInt(macro.target.replace(',',''))) * 100}%` }}></div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-[#FFFFFF] border border-[#CCFBF1] rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-[#CCFBF1] flex justify-between items-center">
          <h2 className="text-xl font-bold">Today's Meals</h2>
          <button className="text-sm text-[#16A34A] hover:underline">Generate New Plan</button>
        </div>
        
        <div className="divide-y divide-[#CCFBF1]">
          {[
            { meal: 'Breakfast', time: '08:00 AM', items: 'Oatmeal with berries & 2 boiled eggs', cal: 450, icon: Coffee },
            { meal: 'Lunch', time: '01:00 PM', items: 'Grilled chicken breast with quinoa and broccoli', cal: 650, icon: Utensils },
            { meal: 'Snack', time: '04:30 PM', items: 'Protein shake & apple', cal: 250, icon: Info },
            { meal: 'Dinner', time: '07:30 PM', items: 'Baked salmon with sweet potato', cal: 550, icon: Utensils },
          ].map((m, i) => (
            <div key={i} className="p-6 flex items-center justify-between hover:bg-[#FFFFFF] transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#E2E8F0] rounded-xl flex items-center justify-center text-[#475569]">
                  <m.icon size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{m.meal} <span className="text-xs font-normal text-[#475569] ml-2">{m.time}</span></h3>
                  <p className="text-sm text-[#475569] mt-1">{m.items}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="font-bold text-[#16A34A]">{m.cal}</span>
                <span className="text-xs text-[#475569] ml-1">kcal</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MemberDiet;