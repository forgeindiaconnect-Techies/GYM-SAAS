import { useState, useEffect } from 'react';
import { Utensils, Apple, Coffee, Moon, CheckCircle2, Dumbbell } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Meal {
  id: number;
  time: string;
  type: string;
  iconType: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  items: string[];
  completed: boolean;
}

const INITIAL_MEALS: Meal[] = [
  {
    id: 1,
    time: '08:00 AM',
    type: 'Breakfast',
    iconType: 'coffee',
    calories: 450,
    protein: 30,
    carbs: 55,
    fats: 12,
    items: ['Oatmeal with berries (1 bowl)', 'Boiled eggs (3 whites, 1 whole)', 'Black Coffee'],
    completed: true
  },
  {
    id: 2,
    time: '01:00 PM',
    type: 'Lunch',
    iconType: 'utensils',
    calories: 650,
    protein: 50,
    carbs: 65,
    fats: 18,
    items: ['Grilled Chicken Breast (200g)', 'Brown Rice (1 cup)', 'Steamed Broccoli'],
    completed: true
  },
  {
    id: 3,
    time: '04:30 PM',
    type: 'Pre-Workout',
    iconType: 'apple',
    calories: 300,
    protein: 25,
    carbs: 35,
    fats: 5,
    items: ['Banana (1 medium)', 'Whey Protein Shake (1 scoop)'],
    completed: false
  },
  {
    id: 4,
    time: '08:30 PM',
    type: 'Dinner',
    iconType: 'moon',
    calories: 550,
    protein: 40,
    carbs: 45,
    fats: 15,
    items: ['Baked Salmon (150g)', 'Sweet Potato (1 medium)', 'Mixed Salad'],
    completed: false
  }
];

const MemberDietPlan = () => {
  const [meals, setMeals] = useState<Meal[]>(() => {
    const saved = localStorage.getItem('member_diet_meals');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return INITIAL_MEALS;
  });

  useEffect(() => {
    localStorage.setItem('member_diet_meals', JSON.stringify(meals));
  }, [meals]);

  const toggleMeal = (id: number) => {
    setMeals(prev => prev.map((m: Meal) => m.id === id ? { ...m, completed: !m.completed } : m));
  };

  const completedMeals = meals.filter((m: Meal) => m.completed);
  const currentCalories = completedMeals.reduce((s: number, m: Meal) => s + m.calories, 0);
  const currentProtein = completedMeals.reduce((s: number, m: Meal) => s + m.protein, 0);
  const currentCarbs = completedMeals.reduce((s: number, m: Meal) => s + m.carbs, 0);
  const currentFats = completedMeals.reduce((s: number, m: Meal) => s + m.fats, 0);

  const macros = [
    { label: 'Calories', current: currentCalories, target: 2200, unit: 'kcal', color: 'bg-orange-500' },
    { label: 'Protein', current: currentProtein, target: 160, unit: 'g', color: 'bg-blue-500' },
    { label: 'Carbs', current: currentCarbs, target: 250, unit: 'g', color: 'bg-green-500' },
    { label: 'Fats', current: currentFats, target: 65, unit: 'g', color: 'bg-purple-500' },
  ];

  const renderIcon = (type: string) => {
    switch (type) {
      case 'coffee': return <Coffee className="text-orange-500" size={24} />;
      case 'utensils': return <Utensils className="text-green-500" size={24} />;
      case 'apple': return <Apple className="text-[#FED7AA]" size={24} />;
      case 'moon': return <Moon className="text-indigo-500" size={24} />;
      default: return <Utensils size={24} />;
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Plan Switcher Tabs */}
      <div className="flex items-center gap-3 border-b border-[#FED7AA] pb-3">
        <Link
          to="/member/workout"
          className="flex items-center gap-2 px-4 py-2 bg-white text-[#78716C] hover:text-[#F97316] hover:bg-[#FFFDF8] rounded-xl font-bold text-sm border border-[#FED7AA] transition-colors"
        >
          <Dumbbell size={16} /> Workout Plan
        </Link>
        <Link
          to="/member/diet"
          className="flex items-center gap-2 px-4 py-2 bg-[#F97316] text-white rounded-xl font-bold text-sm shadow-sm"
        >
          <Utensils size={16} /> Diet Plan
        </Link>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#292524] tracking-tight">Your Diet Plan</h1>
          <p className="text-[#78716C] mt-1">Fuel your body to achieve maximum results. Click a meal to mark it completed.</p>
        </div>
      </div>

      {/* Macros Tracking */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {macros.map((macro, idx) => {
          const percentage = Math.min(100, Math.round((macro.current / macro.target) * 100));
          return (
            <div key={idx} className="bg-white rounded-2xl p-6 border border-[#FED7AA] shadow-sm flex flex-col items-center justify-center relative overflow-hidden group hover:border-[#F97316] transition-all">
              <div className="text-center relative z-10">
                <p className="text-[#78716C] text-sm font-semibold mb-2">{macro.label}</p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-3xl font-bold text-[#292524]">{macro.current}</span>
                  <span className="text-[#78716C] font-medium text-sm">/ {macro.target} {macro.unit}</span>
                </div>
              </div>
              {/* Progress Bar Background */}
              <div className="absolute bottom-0 left-0 h-1.5 w-full bg-[#F1F5F9]">
                <div 
                  className={`h-full ${macro.color} transition-all duration-700 ease-out rounded-r-full`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Daily Meals Timeline */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#FED7AA] shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold text-[#292524]">Today's Meals</h2>
          <span className="text-xs font-semibold text-[#F97316] bg-[#F97316]/10 px-3 py-1 rounded-full">
            {completedMeals.length} of {meals.length} Completed
          </span>
        </div>
        
        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-7 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
          {meals.map((meal: Meal) => (
            <div key={meal.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              {/* Icon / Marker */}
              <button 
                onClick={() => toggleMeal(meal.id)}
                className={`flex items-center justify-center w-14 h-14 rounded-full border-4 border-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-md z-10 transition-transform active:scale-95 cursor-pointer ${
                  meal.completed ? 'bg-green-100 text-green-600' : 'bg-gray-100'
                }`}
                title={meal.completed ? 'Mark incomplete' : 'Mark completed'}
              >
                {meal.completed ? <CheckCircle2 size={24} /> : renderIcon(meal.iconType)}
              </button>
              
              {/* Content Card */}
              <div 
                onClick={() => toggleMeal(meal.id)}
                className={`w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] p-5 rounded-2xl border transition-all cursor-pointer select-none ${
                  meal.completed ? 'bg-green-50/40 border-green-200 shadow-sm' : 'bg-white border-[#FED7AA] hover:border-[#F97316] hover:shadow-md'
                }`}
              >
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <h3 className={`font-bold text-lg ${meal.completed ? 'text-green-800 line-through opacity-80' : 'text-[#292524]'}`}>
                      {meal.type}
                    </h3>
                    {meal.completed && (
                      <span className="text-[10px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">Eaten</span>
                    )}
                  </div>
                  <span className="text-xs font-semibold text-[#78716C] bg-[#F1F5F9] px-2.5 py-1 rounded-full">{meal.time}</span>
                </div>
                <ul className="space-y-1.5 mb-3">
                  {meal.items.map((item: string, i: number) => (
                    <li key={i} className="text-[#78716C] text-sm flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-300 mt-2 shrink-0"></span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex items-center gap-3 pt-2 border-t border-gray-100 text-xs text-[#78716C] font-medium">
                  <span>🔥 {meal.calories} kcal</span>
                  <span>🥩 {meal.protein}g protein</span>
                  <span>🍞 {meal.carbs}g carbs</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MemberDietPlan;
