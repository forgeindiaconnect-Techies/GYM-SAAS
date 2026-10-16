import { useState, useEffect, useMemo } from 'react';
import { 
  Utensils, Apple, Coffee, Moon, CheckCircle2, ShieldCheck, 
  Flame, Droplets, Leaf, Sparkles, Sun, Check, RotateCcw, Calendar
} from 'lucide-react';
import api from '../../utils/api';
import { getUnifiedWeeklyDiet } from '../../utils/aiFitnessPlans';

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

interface DayDietPlan {
  focus: string;
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFats: number;
  meals: Meal[];
}

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;
type DayName = typeof DAYS_OF_WEEK[number];

const DEFAULT_WEEKLY_DIET: Record<DayName, DayDietPlan> = {
  Monday: {
    focus: 'Lean Muscle & Metabolic Activation',
    targetCalories: 2150,
    targetProtein: 155,
    targetCarbs: 210,
    targetFats: 58,
    meals: [
      {
        id: 101,
        time: '07:00 AM',
        type: 'Early Morning Hydration',
        iconType: 'sun',
        calories: 90,
        protein: 3,
        carbs: 15,
        fats: 2,
        items: ['Warm lemon & ginger water (500ml)', '5 overnight soaked almonds', '1 tsp chia seeds'],
        completed: false
      },
      {
        id: 102,
        time: '08:30 AM',
        type: 'Breakfast',
        iconType: 'coffee',
        calories: 450,
        protein: 32,
        carbs: 45,
        fats: 14,
        items: ['3 Scrambled Eggs (or 150g Paneer Bhurji) with baby spinach & tomatoes', '2 slices toasted whole-wheat artisan bread', 'Black Coffee / Green Tea'],
        completed: false
      },
      {
        id: 103,
        time: '11:00 AM',
        type: 'Mid-Morning Snack',
        iconType: 'apple',
        calories: 180,
        protein: 15,
        carbs: 22,
        fats: 2,
        items: ['1 crisp green apple', '1 cup low-fat Greek yogurt with dash of cinnamon'],
        completed: false
      },
      {
        id: 104,
        time: '01:30 PM',
        type: 'High-Protein Lunch',
        iconType: 'utensils',
        calories: 620,
        protein: 50,
        carbs: 65,
        fats: 16,
        items: ['Grilled Chicken Breast (200g) / Tofu steak', 'Steamed brown rice (1 cup)', 'Steamed broccoli, carrots & zucchini with extra virgin olive oil'],
        completed: false
      },
      {
        id: 105,
        time: '05:00 PM',
        type: 'Pre-Workout / Evening Snack',
        iconType: 'apple',
        calories: 260,
        protein: 24,
        carbs: 34,
        fats: 4,
        items: ['1 medium banana with 1 tbsp natural peanut butter', '1 scoop Whey Protein Isolate (or plant protein) shaken with cold water'],
        completed: false
      },
      {
        id: 106,
        time: '08:30 PM',
        type: 'Recovery Dinner',
        iconType: 'moon',
        calories: 550,
        protein: 41,
        carbs: 44,
        fats: 20,
        items: ['Baked Salmon fillet (160g) / Yellow Dal Tadka with grilled paneer', '1 small baked sweet potato', 'Crisp mixed garden salad with lemon-herb dressing'],
        completed: false
      }
    ]
  },
  Tuesday: {
    focus: 'Strength Fuel & High Fiber Endurance',
    targetCalories: 2200,
    targetProtein: 155,
    targetCarbs: 215,
    targetFats: 60,
    meals: [
      {
        id: 201,
        time: '07:00 AM',
        type: 'Early Morning Hydration',
        iconType: 'sun',
        calories: 120,
        protein: 4,
        carbs: 16,
        fats: 5,
        items: ['Warm water with Himalayan pink salt', '2 multigrain rice cakes with almond butter'],
        completed: false
      },
      {
        id: 202,
        time: '08:30 AM',
        type: 'Breakfast',
        iconType: 'coffee',
        calories: 460,
        protein: 30,
        carbs: 58,
        fats: 11,
        items: ['Rolled oats porridge in unsweetened almond milk', 'Topped with fresh blueberries, pumpkin seeds & 1 scoop protein powder', 'Fresh black coffee'],
        completed: false
      },
      {
        id: 203,
        time: '11:00 AM',
        type: 'Mid-Morning Snack',
        iconType: 'apple',
        calories: 190,
        protein: 5,
        carbs: 18,
        fats: 13,
        items: ['Handful of raw walnuts (30g) and golden raisins', '1 cup warm matcha or green tea'],
        completed: false
      },
      {
        id: 204,
        time: '01:30 PM',
        type: 'High-Protein Lunch',
        iconType: 'utensils',
        calories: 640,
        protein: 48,
        carbs: 62,
        fats: 18,
        items: ['Spiced Turkey breast or Chicken Quinoa Bowl (or Rajma kidney bean bowl)', 'Diced Haas avocado, cherry tomatoes, and bell peppers', 'Lime vinaigrette and fresh coriander'],
        completed: false
      },
      {
        id: 205,
        time: '05:00 PM',
        type: 'Pre-Workout / Evening Snack',
        iconType: 'apple',
        calories: 250,
        protein: 16,
        carbs: 36,
        fats: 3,
        items: ['Sprouted moong bean salad with diced cucumbers, tomatoes & lemon chaat masala', 'Organic coconut water (250ml)'],
        completed: false
      },
      {
        id: 206,
        time: '08:30 PM',
        type: 'Recovery Dinner',
        iconType: 'moon',
        calories: 540,
        protein: 42,
        carbs: 35,
        fats: 15,
        items: ['Grilled lemon-herb chicken skewers (or soya chunks/cottage cheese skewers)', 'Sautéed asparagus & baby spinach in garlic olive oil', 'Clear vegetable & herb broth soup'],
        completed: false
      }
    ]
  },
  Wednesday: {
    focus: 'Cellular Repair & Anti-Inflammatory Nutrition',
    targetCalories: 2180,
    targetProtein: 160,
    targetCarbs: 200,
    targetFats: 62,
    meals: [
      {
        id: 301,
        time: '07:00 AM',
        type: 'Early Morning Hydration',
        iconType: 'sun',
        calories: 140,
        protein: 4,
        carbs: 18,
        fats: 6,
        items: ['Warm fenugreek (methi) infused water (500ml)', '1 slice whole-grain artisan toast with mashed avocado'],
        completed: false
      },
      {
        id: 302,
        time: '08:30 AM',
        type: 'Breakfast',
        iconType: 'coffee',
        calories: 420,
        protein: 34,
        carbs: 35,
        fats: 12,
        items: ['Vegetable Egg-White Omelette (4 whites, 1 yolk) with diced peppers & mushrooms', 'Or Moong Dal Chilla stuffed with crumbled paneer & mint chutney', '1 whole fresh sweet orange'],
        completed: false
      },
      {
        id: 303,
        time: '11:00 AM',
        type: 'Mid-Morning Snack',
        iconType: 'apple',
        calories: 130,
        protein: 2,
        carbs: 29,
        fats: 1,
        items: ['1 bowl of fresh cubed papaya or chilled watermelon', 'Chilled infused mint water'],
        completed: false
      },
      {
        id: 304,
        time: '01:30 PM',
        type: 'High-Protein Lunch',
        iconType: 'utensils',
        calories: 650,
        protein: 48,
        carbs: 58,
        fats: 21,
        items: ['Pan-seared Atlantic Salmon fillet (180g) or Chickpea Chana Masala', 'Steamed quinoa (1 cup)', 'Beetroot, rocket leaves & feta salad with light olive drizzle'],
        completed: false
      },
      {
        id: 305,
        time: '05:00 PM',
        type: 'Pre-Workout / Evening Snack',
        iconType: 'apple',
        calories: 240,
        protein: 20,
        carbs: 26,
        fats: 4,
        items: ['Low-fat Greek yogurt cup with 1 tsp ground flaxseeds', 'Freshly sliced strawberries & blueberries'],
        completed: false
      },
      {
        id: 306,
        time: '08:30 PM',
        type: 'Recovery Dinner',
        iconType: 'moon',
        calories: 560,
        protein: 50,
        carbs: 38,
        fats: 18,
        items: ['Stir-fried lean chicken breast strips (or grilled paneer)', 'Zucchini, snow peas, bok choy & mushrooms in light toasted sesame oil', 'Warm cauliflower & lentil purée'],
        completed: false
      }
    ]
  },
  Thursday: {
    focus: 'Lean Carb Cycling & Sustained Energy',
    targetCalories: 2120,
    targetProtein: 152,
    targetCarbs: 205,
    targetFats: 59,
    meals: [
      {
        id: 401,
        time: '07:00 AM',
        type: 'Early Morning Hydration',
        iconType: 'sun',
        calories: 130,
        protein: 3,
        carbs: 22,
        fats: 4,
        items: ['Warm water with 1 tbsp raw apple cider vinegar', '2 Medjool dates + 4 walnut halves'],
        completed: false
      },
      {
        id: 402,
        time: '08:30 AM',
        type: 'Breakfast',
        iconType: 'coffee',
        calories: 430,
        protein: 36,
        carbs: 50,
        fats: 10,
        items: ['High-Protein Smoothie Bowl: unsweetened almond milk, ripe banana, spinach & whey protein', 'Topped with roasted pumpkin seeds & toasted coconut flakes', 'Americano / Espresso'],
        completed: false
      },
      {
        id: 403,
        time: '11:00 AM',
        type: 'Mid-Morning Snack',
        iconType: 'apple',
        calories: 160,
        protein: 6,
        carbs: 18,
        fats: 8,
        items: ['Crisp cucumber & carrot crudités', '3 tbsp roasted red pepper hummus dip'],
        completed: false
      },
      {
        id: 404,
        time: '01:30 PM',
        type: 'High-Protein Lunch',
        iconType: 'utensils',
        calories: 660,
        protein: 50,
        carbs: 60,
        fats: 20,
        items: ['Lemon-rosemary grilled chicken thigh (200g) / Spiced vegetable & lentil khichdi', 'Mediterranean roasted zucchini, bell peppers & baby potatoes', '1 bowl fresh low-fat curd (dahi) with roasted cumin'],
        completed: false
      },
      {
        id: 405,
        time: '05:00 PM',
        type: 'Pre-Workout / Evening Snack',
        iconType: 'apple',
        calories: 200,
        protein: 8,
        carbs: 32,
        fats: 4,
        items: ['Roasted fox nuts (makhana) lightly seasoned with pink salt & turmeric', 'Hot antioxidant green tea with lemon'],
        completed: false
      },
      {
        id: 406,
        time: '08:30 PM',
        type: 'Recovery Dinner',
        iconType: 'moon',
        calories: 540,
        protein: 49,
        carbs: 43,
        fats: 13,
        items: ['Steamed white cod or tilapia fillet (or grilled paneer steaks)', 'Hearty vegetable minestrone soup with kidney beans', 'Steamed French beans with roasted almond slivers'],
        completed: false
      }
    ]
  },
  Friday: {
    focus: 'Peak Performance & Glycogen Replenishment',
    targetCalories: 2240,
    targetProtein: 158,
    targetCarbs: 220,
    targetFats: 64,
    meals: [
      {
        id: 501,
        time: '07:00 AM',
        type: 'Early Morning Hydration',
        iconType: 'sun',
        calories: 120,
        protein: 3,
        carbs: 24,
        fats: 2,
        items: ['Freshly brewed organic green tea', '5 soaked almonds & 1 small banana'],
        completed: false
      },
      {
        id: 502,
        time: '08:30 AM',
        type: 'Breakfast',
        iconType: 'coffee',
        calories: 450,
        protein: 32,
        carbs: 42,
        fats: 15,
        items: ['Poached eggs (3 eggs) or Smashed spiced tofu on toasted artisan sourdough', 'Sautéed baby spinach & grilled cherry tomatoes', 'Fresh long black coffee'],
        completed: false
      },
      {
        id: 503,
        time: '11:00 AM',
        type: 'Mid-Morning Snack',
        iconType: 'apple',
        calories: 110,
        protein: 2,
        carbs: 26,
        fats: 1,
        items: ['1 whole ripe juicy pear or fresh guava slices with chaat masala', 'Electrolyte water'],
        completed: false
      },
      {
        id: 504,
        time: '01:30 PM',
        type: 'High-Protein Lunch',
        iconType: 'utensils',
        calories: 670,
        protein: 52,
        carbs: 68,
        fats: 19,
        items: ['Chicken & Bell Pepper Fajita Bowl (or Black Bean & Sweet Corn Fajita Bowl)', 'Steamed wild brown rice (1 cup)', 'Fresh handmade guacamole, pico de gallo & shredded lettuce'],
        completed: false
      },
      {
        id: 505,
        time: '05:00 PM',
        type: 'Pre-Workout / Evening Snack',
        iconType: 'apple',
        calories: 220,
        protein: 18,
        carbs: 16,
        fats: 7,
        items: ['3 Boiled egg whites sprinkled with black pepper (or roasted chana & sunflower seeds mix)', 'Fresh iced peppermint tea'],
        completed: false
      },
      {
        id: 506,
        time: '08:30 PM',
        type: 'Recovery Dinner',
        iconType: 'moon',
        calories: 550,
        protein: 48,
        carbs: 38,
        fats: 18,
        items: ['Pan-seared Tuna or Tilapia steak (or Thai tofu & broccoli red curry with light coconut milk)', 'Cauliflower rice tossed with fresh herbs', 'Crunchy cucumber, radish & sesame salad'],
        completed: false
      }
    ]
  },
  Saturday: {
    focus: 'Weekend Vitality & Clean Refuel',
    targetCalories: 2280,
    targetProtein: 162,
    targetCarbs: 230,
    targetFats: 63,
    meals: [
      {
        id: 601,
        time: '07:00 AM',
        type: 'Early Morning Hydration',
        iconType: 'sun',
        calories: 140,
        protein: 3,
        carbs: 22,
        fats: 5,
        items: ['Warm water with fresh lemon squeeze', '1 crisp apple with 1 tbsp creamy peanut butter'],
        completed: false
      },
      {
        id: 602,
        time: '08:30 AM',
        type: 'Breakfast',
        iconType: 'coffee',
        calories: 490,
        protein: 35,
        carbs: 62,
        fats: 11,
        items: ['Protein Oat Pancakes (oats, banana, egg whites / plant protein)', 'Topped with fresh blueberries & 1 tsp pure raw honey', 'Fresh brewed coffee / herbal tea'],
        completed: false
      },
      {
        id: 603,
        time: '11:00 AM',
        type: 'Mid-Morning Snack',
        iconType: 'apple',
        calories: 130,
        protein: 2,
        carbs: 22,
        fats: 3,
        items: ['Fresh tender coconut water with soft coconut meat', 'Handful of roasted pumpkin seeds'],
        completed: false
      },
      {
        id: 604,
        time: '01:30 PM',
        type: 'High-Protein Lunch',
        iconType: 'utensils',
        calories: 640,
        protein: 48,
        carbs: 64,
        fats: 18,
        items: ['Mediterranean Grilled Chicken Wrap (or Crispy Baked Falafel & Hummus wrap) in whole-wheat tortilla', 'Cucumber, tomato & parsley tabbouleh salad', 'Greek tzatziki sauce'],
        completed: false
      },
      {
        id: 605,
        time: '05:00 PM',
        type: 'Pre-Workout / Evening Snack',
        iconType: 'apple',
        calories: 210,
        protein: 17,
        carbs: 18,
        fats: 7,
        items: ['Steamed edamame pods tossed with sea salt & crushed pepper', 'Iced unsweetened green tea with mint'],
        completed: false
      },
      {
        id: 606,
        time: '08:30 PM',
        type: 'Recovery Dinner',
        iconType: 'moon',
        calories: 570,
        protein: 49,
        carbs: 46,
        fats: 17,
        items: ['Herb-roasted chicken breast (or oven-roasted paneer skewers)', 'Baked sweet potato wedges with rosemary & olive oil', 'Grilled asparagus spears & charred zucchini'],
        completed: false
      }
    ]
  },
  Sunday: {
    focus: 'Gut Reset & Active Recovery Nutrition',
    targetCalories: 2100,
    targetProtein: 148,
    targetCarbs: 200,
    targetFats: 58,
    meals: [
      {
        id: 701,
        time: '07:30 AM',
        type: 'Early Morning Hydration',
        iconType: 'sun',
        calories: 50,
        protein: 1,
        carbs: 9,
        fats: 0,
        items: ['Warm water infused with fresh mint leaves and lemon slices', 'Chamomile herbal infusion (no sugar)'],
        completed: false
      },
      {
        id: 702,
        time: '09:00 AM',
        type: 'Breakfast',
        iconType: 'coffee',
        calories: 430,
        protein: 28,
        carbs: 40,
        fats: 17,
        items: ['Traditional Shakshuka (3 poached eggs in rich tomato, bell pepper & cumin sauce)', 'Or Tofu Scramble Shakshuka with mushrooms', '1 slice artisan multigrain toast'],
        completed: false
      },
      {
        id: 703,
        time: '11:30 AM',
        type: 'Mid-Morning Snack',
        iconType: 'apple',
        calories: 140,
        protein: 3,
        carbs: 31,
        fats: 1,
        items: ['1 whole fresh ruby pomegranate or 2 peeled golden kiwis', 'Refreshing mint & cucumber water'],
        completed: false
      },
      {
        id: 704,
        time: '01:30 PM',
        type: 'High-Protein Lunch',
        iconType: 'utensils',
        calories: 630,
        protein: 48,
        carbs: 65,
        fats: 16,
        items: ['Herb-infused roasted chicken breast (or hearty mixed Dal Tadka with paneer cubes)', 'Steamed basmati rice (1 cup)', 'Cumin-infused cucumber raita and fresh tomato-onion kachumber salad'],
        completed: false
      },
      {
        id: 705,
        time: '05:00 PM',
        type: 'Evening Snack',
        iconType: 'apple',
        calories: 220,
        protein: 8,
        carbs: 18,
        fats: 15,
        items: ['Antioxidant trail mix (almonds, walnuts, dried cranberries, pumpkin seeds)', 'Warm herbal detox tea'],
        completed: false
      },
      {
        id: 706,
        time: '08:30 PM',
        type: 'Recovery Dinner',
        iconType: 'moon',
        calories: 530,
        protein: 46,
        carbs: 37,
        fats: 16,
        items: ['Grilled white fish fillet (or hearty vegetable & red lentil hot pot stew)', 'Steamed broccoli, carrots & baby corn in clear savory broth', 'Warm turmeric golden milk with pinch of black pepper before bedtime'],
        completed: false
      }
    ]
  }
};

const MemberDietPlan = () => {
  // Determine initial day based on today's calendar day
  const getTodayDayName = (): DayName => {
    const dayIndex = new Date().getDay(); // 0 = Sunday, 1 = Monday, ...
    const dayNames: DayName[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return dayNames[dayIndex] || 'Monday';
  };

  const todayDayName = useMemo(() => getTodayDayName(), []);
  const [selectedDay, setSelectedDay] = useState<DayName>(todayDayName);
  const [approvedDietPlan, setApprovedDietPlan] = useState<any | null>(null);
  const [aiRecommendation, setAiRecommendation] = useState<any | null>(null);

  // Store completed meal IDs per day in state and localStorage
  const [completedMap, setCompletedMap] = useState<Record<string, number[]>>(() => {
    try {
      const saved = localStorage.getItem('member_weekly_diet_completed');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return {};
  });

  useEffect(() => {
    try {
      localStorage.setItem('member_weekly_diet_completed', JSON.stringify(completedMap));
    } catch (e) {
      console.error(e);
    }
  }, [completedMap]);

  // Fetch Trainer approved diet plan & AI recommendation
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [trainerRes, aiRes] = await Promise.allSettled([
          api.get('/trainer-plans/customer'),
          api.get('/ai/member/latest')
        ]);

        if (trainerRes.status === 'fulfilled' && trainerRes.value.data?.success && trainerRes.value.data.requests) {
          const approved = trainerRes.value.data.requests.find(
            (r: any) => r.planType === 'Diet Plan' && r.status === 'Approved'
          );
          if (approved) setApprovedDietPlan(approved);
        }

        if (aiRes.status === 'fulfilled' && aiRes.value.data?.success && aiRes.value.data.recommendation) {
          setAiRecommendation(aiRes.value.data.recommendation);
        }
      } catch (err) {
        console.error('Failed to load diet plans:', err);
      }
    };
    fetchData();
  }, []);

  // Compute active day's plan synchronized with AI recommendation and MemberAIFitness
  const currentDayPlan = useMemo((): DayDietPlan => {
    const unified = getUnifiedWeeklyDiet(aiRecommendation);
    const dayData = unified[selectedDay] || unified.Monday;
    const completedIds = completedMap[selectedDay] || [];

    const meals: Meal[] = [
      {
        id: 1,
        time: '07:00 AM',
        type: 'Early Morning Hydration',
        iconType: 'sun',
        calories: 90,
        protein: 3,
        carbs: 15,
        fats: 2,
        items: [dayData.morning],
        completed: completedIds.includes(1)
      },
      {
        id: 2,
        time: '08:30 AM',
        type: 'Breakfast',
        iconType: 'coffee',
        calories: 450,
        protein: parseInt(dayData.macros?.protein) > 40 ? 32 : 28,
        carbs: 45,
        fats: 14,
        items: [dayData.breakfast],
        completed: completedIds.includes(2)
      },
      {
        id: 3,
        time: '11:00 AM',
        type: 'Mid-Morning Snack',
        iconType: 'apple',
        calories: 160,
        protein: 10,
        carbs: 22,
        fats: 3,
        items: [dayData.midMorning],
        completed: completedIds.includes(3)
      },
      {
        id: 4,
        time: '01:30 PM',
        type: 'High-Protein Lunch',
        iconType: 'utensils',
        calories: 650,
        protein: parseInt(dayData.macros?.protein) > 40 ? 50 : 40,
        carbs: 65,
        fats: 18,
        items: [dayData.lunch],
        completed: completedIds.includes(4)
      },
      {
        id: 5,
        time: '05:00 PM',
        type: 'Evening / Pre-Workout Snack',
        iconType: 'apple',
        calories: 220,
        protein: 15,
        carbs: 26,
        fats: 5,
        items: [dayData.evening],
        completed: completedIds.includes(5)
      },
      {
        id: 6,
        time: '08:30 PM',
        type: 'Recovery Dinner',
        iconType: 'moon',
        calories: 530,
        protein: 45,
        carbs: 38,
        fats: 16,
        items: [dayData.dinner],
        completed: completedIds.includes(6)
      }
    ];

    return {
      focus: dayData.focus,
      targetCalories: dayData.calories,
      targetProtein: parseInt(dayData.macros?.protein) || 155,
      targetCarbs: parseInt(dayData.macros?.carbs) || 210,
      targetFats: parseInt(dayData.macros?.fats) || 58,
      meals
    };
  }, [selectedDay, aiRecommendation, completedMap]);

  // Toggle single meal completed
  const toggleMeal = (id: number) => {
    setCompletedMap(prev => {
      const currentList = prev[selectedDay] || [];
      const updated = currentList.includes(id)
        ? currentList.filter(item => item !== id)
        : [...currentList, id];
      return { ...prev, [selectedDay]: updated };
    });
  };

  // Mark all completed for selected day
  const markAllCompleted = () => {
    const allIds = currentDayPlan.meals.map(m => m.id);
    setCompletedMap(prev => ({ ...prev, [selectedDay]: allIds }));
  };

  // Reset selected day
  const resetDay = () => {
    setCompletedMap(prev => ({ ...prev, [selectedDay]: [] }));
  };

  // Calculate macros for selected day
  const completedMeals = currentDayPlan.meals.filter(m => m.completed);
  const currentCalories = completedMeals.reduce((s, m) => s + m.calories, 0);
  const currentProtein = completedMeals.reduce((s, m) => s + m.protein, 0);
  const currentCarbs = completedMeals.reduce((s, m) => s + m.carbs, 0);
  const currentFats = completedMeals.reduce((s, m) => s + m.fats, 0);

  const targetCals = approvedDietPlan?.dietDetails?.dailyCalories || currentDayPlan.targetCalories;
  const targetProtein = approvedDietPlan?.dietDetails?.protein || currentDayPlan.targetProtein;
  const targetCarbs = approvedDietPlan?.dietDetails?.carbs || currentDayPlan.targetCarbs;
  const targetFats = approvedDietPlan?.dietDetails?.fats || currentDayPlan.targetFats;

  const macros = [
    { label: 'Calories', current: currentCalories, target: targetCals, unit: 'kcal', color: 'bg-orange-500' },
    { label: 'Protein', current: currentProtein, target: targetProtein, unit: 'g', color: 'bg-blue-500' },
    { label: 'Carbs', current: currentCarbs, target: targetCarbs, unit: 'g', color: 'bg-green-500' },
    { label: 'Fats', current: currentFats, target: targetFats, unit: 'g', color: 'bg-purple-500' },
  ];

  const renderIcon = (type: string) => {
    switch (type) {
      case 'coffee': return <Coffee className="text-orange-500" size={24} />;
      case 'utensils': return <Utensils className="text-green-500" size={24} />;
      case 'apple': return <Apple className="text-[#EA580C]" size={24} />;
      case 'moon': return <Moon className="text-indigo-500" size={24} />;
      case 'sun': return <Sun className="text-amber-500" size={24} />;
      default: return <Utensils size={24} />;
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-3xl font-extrabold text-[#292524] tracking-tight">Your Diet Plan</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-[#F97316] border border-orange-200">
              Monday – Sunday
            </span>
          </div>
          <p className="text-[#78716C] text-sm">
            Fuel your body with tailored, non-repeating daily meals from Monday to Sunday. Click any meal to mark it completed.
          </p>
        </div>

        {/* Quick Day Actions */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={markAllCompleted}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            title="Mark all meals eaten for this day"
          >
            <Check size={14} /> Mark All Eaten
          </button>
          <button
            onClick={resetDay}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#FFFDF8] text-[#78716C] border border-[#E7E5E4] hover:text-[#292524] transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Reset meals for this day"
          >
            <RotateCcw size={14} /> Reset Day
          </button>
        </div>
      </div>

      {/* Trainer Approved Diet Banner */}
      {approvedDietPlan && (
        <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-amber-50 border-2 border-emerald-300 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-emerald-200/70 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-extrabold text-xl shadow-md">
                <ShieldCheck size={26} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                    <CheckCircle2 size={12} className="text-emerald-700" /> Approved by Trainer
                  </span>
                  <span className="text-xs text-[#78716C]">
                    Coach {approvedDietPlan.trainerId?.name || approvedDietPlan.trainerId?.firstName || 'Assigned Trainer'}
                  </span>
                </div>
                <h2 className="text-xl font-extrabold text-[#292524] mt-1">
                  {approvedDietPlan.title}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-900 bg-emerald-100/80 px-3 py-1.5 rounded-xl border border-emerald-300">
                Target: {approvedDietPlan.goal || 'Fitness & Nutrition'}
              </span>
            </div>
          </div>

          {approvedDietPlan.trainerFeedback && (
            <div className="bg-white/80 backdrop-blur-xs p-3.5 rounded-2xl border border-emerald-200 text-xs text-stone-700 italic">
              <strong>Coach Notes:</strong> &ldquo;{approvedDietPlan.trainerFeedback}&rdquo;
            </div>
          )}

          {approvedDietPlan.dietDetails && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              <div className="bg-white p-3 rounded-2xl border border-emerald-100 text-center">
                <Flame size={16} className="mx-auto text-orange-500 mb-1" />
                <div className="text-base font-extrabold text-[#292524]">
                  {approvedDietPlan.dietDetails.dailyCalories || targetCals} kcal
                </div>
                <div className="text-[10px] font-bold text-[#78716C] uppercase">Daily Target</div>
              </div>
              <div className="bg-white p-3 rounded-2xl border border-emerald-100 text-center">
                <Leaf size={16} className="mx-auto text-emerald-600 mb-1" />
                <div className="text-base font-extrabold text-[#292524]">
                  {approvedDietPlan.dietDetails.protein || targetProtein}g
                </div>
                <div className="text-[10px] font-bold text-[#78716C] uppercase">Protein</div>
              </div>
              <div className="bg-white p-3 rounded-2xl border border-emerald-100 text-center">
                <Utensils size={16} className="mx-auto text-amber-500 mb-1" />
                <div className="text-base font-extrabold text-[#292524]">
                  {approvedDietPlan.dietDetails.carbs || targetCarbs}g
                </div>
                <div className="text-[10px] font-bold text-[#78716C] uppercase">Carbohydrates</div>
              </div>
              <div className="bg-white p-3 rounded-2xl border border-emerald-100 text-center">
                <Droplets size={16} className="mx-auto text-blue-500 mb-1" />
                <div className="text-base font-extrabold text-[#292524]">
                  {approvedDietPlan.dietDetails.hydration || '3 - 4 Liters'}
                </div>
                <div className="text-[10px] font-bold text-[#78716C] uppercase">Hydration</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===================== MONDAY TO SUNDAY SELECTOR TABS ===================== */}
      <div className="bg-white border border-[#E7E5E4] rounded-3xl p-4 md:p-6 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F5F5F4] pb-3">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-[#F97316]" />
            <h3 className="text-sm font-extrabold text-[#292524] uppercase tracking-wider">
              Select Day of the Week
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#78716C]">
              Currently Viewing: <strong className="text-[#F97316]">{selectedDay}</strong>
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-orange-50 text-[#F97316] font-extrabold border border-orange-200">
              {currentDayPlan.focus}
            </span>
          </div>
        </div>

        {/* 7-Day Buttons Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
          {DAYS_OF_WEEK.map((day) => {
            const isSelected = selectedDay === day;
            const isToday = todayDayName === day;
            const completedCount = (completedMap[day] || []).length;
            const totalForDay = (DEFAULT_WEEKLY_DIET[day]?.meals || []).length;
            const isFullyCompleted = completedCount > 0 && completedCount >= totalForDay;

            return (
              <button
                key={day}
                type="button"
                onClick={() => setSelectedDay(day)}
                className={`relative flex flex-col items-center justify-center py-3 px-2 rounded-2xl text-xs font-bold transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-gradient-to-b from-[#F97316] to-[#EA580C] text-white border-[#F97316] shadow-md shadow-orange-500/20 scale-[1.02]'
                    : 'bg-[#FFFDF8] text-[#78716C] border-[#E7E5E4] hover:border-[#F97316]/50 hover:text-[#292524]'
                }`}
              >
                {/* Today Pill */}
                {isToday && (
                  <span
                    className={`absolute -top-2 px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border shadow-2xs ${
                      isSelected
                        ? 'bg-white text-[#EA580C] border-white'
                        : 'bg-[#F97316] text-white border-[#F97316]'
                    }`}
                  >
                    Today
                  </span>
                )}

                <span className="text-sm font-extrabold">{day}</span>
                <span className={`text-[10px] mt-0.5 font-medium ${isSelected ? 'text-white/80' : 'text-[#78716C]'}`}>
                  {DEFAULT_WEEKLY_DIET[day]?.targetCalories || 2150} kcal
                </span>

                {/* Completion Status Indicator */}
                <div className="mt-1 flex items-center gap-1">
                  {isFullyCompleted ? (
                    <span className={`flex items-center text-[10px] font-bold ${isSelected ? 'text-white' : 'text-emerald-600'}`}>
                      <CheckCircle2 size={12} className="mr-0.5" /> All Done
                    </span>
                  ) : completedCount > 0 ? (
                    <span className={`text-[10px] font-semibold ${isSelected ? 'text-white/90' : 'text-[#F97316]'}`}>
                      {completedCount}/{totalForDay} eaten
                    </span>
                  ) : (
                    <span className={`text-[10px] ${isSelected ? 'text-white/60' : 'text-gray-400'}`}>
                      {totalForDay} meals
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Macros Tracking for Selected Day */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {macros.map((macro, idx) => {
          const percentage = Math.min(100, Math.round((macro.current / macro.target) * 100));
          return (
            <div key={idx} className="bg-white rounded-2xl p-6 border border-[#FED7AA] shadow-xs flex flex-col items-center justify-center relative overflow-hidden group hover:border-[#F97316] transition-all">
              <div className="text-center relative z-10">
                <p className="text-[#78716C] text-sm font-semibold mb-2">{macro.label}</p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-3xl font-extrabold text-[#292524]">{macro.current}</span>
                  <span className="text-[#78716C] font-medium text-sm">/ {macro.target} {macro.unit}</span>
                </div>
                <span className="text-[11px] font-bold text-[#F97316] mt-1 block">
                  {percentage}% consumed
                </span>
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

      {/* Selected Day's Meals Timeline */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#FED7AA] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-[#292524]">{selectedDay}&apos;s Meal Schedule</h2>
              {selectedDay === todayDayName && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Today
                </span>
              )}
            </div>
            <p className="text-xs text-[#78716C] mt-0.5">
              {currentDayPlan.focus} • Click any meal to mark it eaten
            </p>
          </div>

          <span className="text-xs font-semibold text-[#F97316] bg-[#F97316]/10 px-3 py-1.5 rounded-full self-start sm:self-auto">
            {completedMeals.length} of {currentDayPlan.meals.length} Completed ({Math.round((completedMeals.length / (currentDayPlan.meals.length || 1)) * 100)}%)
          </span>
        </div>
        
        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-7 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
          {currentDayPlan.meals.map((meal: Meal) => (
            <div key={meal.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              {/* Icon / Marker */}
              <button 
                type="button"
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
                  meal.completed ? 'bg-green-50/40 border-green-200 shadow-xs' : 'bg-white border-[#FED7AA] hover:border-[#F97316] hover:shadow-md'
                }`}
              >
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <h3 className={`font-bold text-lg ${meal.completed ? 'text-green-800 line-through opacity-80' : 'text-[#292524]'}`}>
                      {meal.type}
                    </h3>
                    {meal.completed && (
                      <span className="text-[10px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Check size={11} /> Eaten
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-semibold text-[#78716C] bg-[#F1F5F9] px-2.5 py-1 rounded-full">{meal.time}</span>
                </div>
                <ul className="space-y-1.5 mb-3">
                  {meal.items.map((item: string, i: number) => (
                    <li key={i} className="text-[#78716C] text-sm flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-2 shrink-0"></span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex items-center gap-3 pt-2.5 border-t border-gray-100 text-xs text-[#78716C] font-semibold flex-wrap">
                  <span className="text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md">🔥 {meal.calories} kcal</span>
                  <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">🥩 {meal.protein}g protein</span>
                  <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded-md">🍞 {meal.carbs}g carbs</span>
                  <span className="text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md">🥑 {meal.fats}g fats</span>
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
