import React from 'react';
import { Utensils, Apple, Coffee, Moon, CheckCircle2 } from 'lucide-react';

const MemberDietPlan = () => {
  const macros = [
    { label: 'Calories', current: 1850, target: 2200, unit: 'kcal', color: 'bg-orange-500' },
    { label: 'Protein', current: 120, target: 160, unit: 'g', color: 'bg-blue-500' },
    { label: 'Carbs', current: 180, target: 250, unit: 'g', color: 'bg-green-500' },
    { label: 'Fats', current: 45, target: 65, unit: 'g', color: 'bg-purple-500' },
  ];

  const meals = [
    {
      time: '08:00 AM',
      type: 'Breakfast',
      icon: <Coffee className="text-orange-500" size={24} />,
      items: ['Oatmeal with berries (1 bowl)', 'Boiled eggs (3 whites, 1 whole)', 'Black Coffee'],
      completed: true
    },
    {
      time: '01:00 PM',
      type: 'Lunch',
      icon: <Utensils className="text-green-500" size={24} />,
      items: ['Grilled Chicken Breast (200g)', 'Brown Rice (1 cup)', 'Steamed Broccoli'],
      completed: true
    },
    {
      time: '04:30 PM',
      type: 'Pre-Workout',
      icon: <Apple className="text-[#6fa3a0]" size={24} />,
      items: ['Banana (1 medium)', 'Whey Protein Shake (1 scoop)'],
      completed: false
    },
    {
      time: '08:30 PM',
      type: 'Dinner',
      icon: <Moon className="text-indigo-500" size={24} />,
      items: ['Baked Salmon (150g)', 'Sweet Potato (1 medium)', 'Mixed Salad'],
      completed: false
    }
  ];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#202828] tracking-tight">Your Diet Plan</h1>
          <p className="text-[#455250] mt-1">Fuel your body to achieve maximum results.</p>
        </div>
      </div>

      {/* Macros Tracking */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {macros.map((macro, idx) => {
          const percentage = Math.round((macro.current / macro.target) * 100);
          return (
            <div key={idx} className="bg-white rounded-2xl p-6 border border-[#E8E5DA] shadow-sm flex flex-col items-center justify-center relative overflow-hidden group hover:border-[#164A4A] transition-all">
              <div className="text-center relative z-10">
                <p className="text-[#687B78] text-sm font-semibold mb-2">{macro.label}</p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-3xl font-bold text-[#202828]">{macro.current}</span>
                  <span className="text-[#A8ADA9] font-medium text-sm">/ {macro.target} {macro.unit}</span>
                </div>
              </div>
              {/* Progress Bar Background */}
              <div className="absolute bottom-0 left-0 h-1.5 w-full bg-[#F1F5F9]">
                <div 
                  className={`h-full ${macro.color} transition-all duration-1000 ease-out rounded-r-full`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Daily Meals Timeline */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#E8E5DA] shadow-sm">
        <h2 className="text-xl font-bold text-[#202828] mb-8">Today's Meals</h2>
        
        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-7 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
          {meals.map((meal, index) => (
            <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              {/* Icon / Marker */}
              <div className={`flex items-center justify-center w-14 h-14 rounded-full border-4 border-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-md z-10 ${
                meal.completed ? 'bg-green-100' : 'bg-gray-100'
              }`}>
                {meal.completed ? <CheckCircle2 className="text-green-500" size={24} /> : meal.icon}
              </div>
              
              {/* Content Card */}
              <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] p-5 rounded-2xl border transition-all ${
                meal.completed ? 'bg-green-50/30 border-green-200' : 'bg-white border-[#E8E5DA] hover:border-gray-300 hover:shadow-md'
              }`}>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold text-[#202828] text-lg">{meal.type}</h3>
                  <span className="text-sm font-semibold text-[#687B78] bg-[#F1F5F9] px-3 py-1 rounded-full">{meal.time}</span>
                </div>
                <ul className="space-y-2">
                  {meal.items.map((item, i) => (
                    <li key={i} className="text-[#455250] text-sm flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-300 mt-1.5 shrink-0"></span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MemberDietPlan;
