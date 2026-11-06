import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  RefreshControl, 
  Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';

interface Meal {
  id: string;
  name: string;
  time: string;
  description: string;
  cals: number;
  protein: number;
  carbs: number;
  fats: number;
  icon: string;
}

interface DayDietSchedule {
  day: string;
  focus: string;
  meals: Meal[];
}

const WEEKLY_DIET_SCHEDULE: Record<string, DayDietSchedule> = {
  Monday: {
    day: 'Monday',
    focus: 'Lean Muscle & Metabolic Activation',
    meals: [
      {
        id: 'mon-m1',
        name: 'Morning Hydration & Pre-Workout',
        time: '05:30 AM',
        description: 'Warm water with pinch of pink Himalayan salt. Pre-workout: 1 small banana or 2 rice cakes with peanut butter.',
        cals: 150,
        protein: 4,
        carbs: 28,
        fats: 3,
        icon: 'sunny-outline',
      },
      {
        id: 'mon-m2',
        name: 'Post-Workout Breakfast',
        time: '07:30 AM',
        description: '3-4 whole eggs scrambled with spinach and mushrooms (or 150g paneer bhurji), 2 slices whole-wheat toast, fresh fruit.',
        cals: 520,
        protein: 36,
        carbs: 48,
        fats: 20,
        icon: 'cafe-outline',
      },
      {
        id: 'mon-m3',
        name: 'Mid-Morning Snack',
        time: '11:00 AM',
        description: '1 crisp apple + 1 cup low-fat Greek yogurt with dash of cinnamon.',
        cals: 190,
        protein: 15,
        carbs: 26,
        fats: 3,
        icon: 'nutrition-outline',
      },
      {
        id: 'mon-m4',
        name: 'High-Protein Lunch',
        time: '01:30 PM',
        description: '150g low-fat paneer/tofu or large bowl dal/chana with large serving mixed green salad with olive oil and 1 cup brown rice.',
        cals: 620,
        protein: 45,
        carbs: 62,
        fats: 16,
        icon: 'restaurant-outline',
      },
      {
        id: 'mon-m5',
        name: 'Evening Snack / Post-Workout',
        time: '05:30 PM',
        description: '1 scoop Whey Protein Isolate shaken with cold water + handful of roasted chana.',
        cals: 220,
        protein: 26,
        carbs: 18,
        fats: 4,
        icon: 'flash-outline',
      },
      {
        id: 'mon-m6',
        name: 'Recovery Dinner',
        time: '08:30 PM',
        description: 'Grilled paneer/tofu with sautéed bell peppers (or lentils), minimal complex carbs (sweet potato), mixed vegetable soup.',
        cals: 450,
        protein: 29,
        carbs: 28,
        fats: 12,
        icon: 'moon-outline',
      },
    ],
  },
  Tuesday: {
    day: 'Tuesday',
    focus: 'Strength Fuel & High-Fiber Endurance',
    meals: [
      {
        id: 'tue-m1',
        name: 'Morning Hydration & Pre-Workout',
        time: '05:30 AM',
        description: 'Warm water with Himalayan pink salt & chia seeds. Pre-workout: 2 rice cakes with almond butter.',
        cals: 160,
        protein: 5,
        carbs: 24,
        fats: 6,
        icon: 'sunny-outline',
      },
      {
        id: 'tue-m2',
        name: 'Breakfast',
        time: '07:30 AM',
        description: 'Rolled oats porridge in unsweetened almond milk topped with fresh blueberries, pumpkin seeds & protein scoop.',
        cals: 510,
        protein: 34,
        carbs: 58,
        fats: 14,
        icon: 'cafe-outline',
      },
      {
        id: 'tue-m3',
        name: 'Mid-Morning Snack',
        time: '11:00 AM',
        description: 'Handful of raw walnuts (30g) and golden raisins + green tea.',
        cals: 210,
        protein: 6,
        carbs: 22,
        fats: 12,
        icon: 'nutrition-outline',
      },
      {
        id: 'tue-m4',
        name: 'High-Protein Lunch',
        time: '01:30 PM',
        description: 'Shredded chicken quinoa bowl (or rajma kidney bean bowl) with avocado, cherry tomatoes & lime vinaigrette.',
        cals: 640,
        protein: 48,
        carbs: 60,
        fats: 16,
        icon: 'restaurant-outline',
      },
      {
        id: 'tue-m5',
        name: 'Evening Snack',
        time: '05:30 PM',
        description: 'Sprouted moong bean salad with diced cucumbers, tomatoes & lemon chaat masala.',
        cals: 210,
        protein: 16,
        carbs: 25,
        fats: 4,
        icon: 'flash-outline',
      },
      {
        id: 'tue-m6',
        name: 'Dinner',
        time: '08:30 PM',
        description: 'Grilled lemon-herb chicken skewers (or grilled paneer) + sautéed asparagus & baby spinach + clear broth soup.',
        cals: 470,
        protein: 46,
        carbs: 26,
        fats: 8,
        icon: 'moon-outline',
      },
    ],
  },
  Wednesday: {
    day: 'Wednesday',
    focus: 'Cellular Repair & Anti-Inflammatory Nutrition',
    meals: [
      {
        id: 'wed-m1',
        name: 'Morning Hydration',
        time: '06:00 AM',
        description: 'Warm fenugreek (methi) water (500ml) + 1 slice whole-grain toast with mashed avocado.',
        cals: 170,
        protein: 4,
        carbs: 18,
        fats: 9,
        icon: 'sunny-outline',
      },
      {
        id: 'wed-m2',
        name: 'Breakfast',
        time: '08:00 AM',
        description: 'Vegetable egg-white omelette (4 whites, 1 yolk) with diced peppers & mushrooms + 1 sweet orange.',
        cals: 480,
        protein: 38,
        carbs: 42,
        fats: 14,
        icon: 'cafe-outline',
      },
      {
        id: 'wed-m3',
        name: 'Mid-Morning Snack',
        time: '11:00 AM',
        description: '1 bowl fresh cubed papaya or chilled watermelon + mint infused water.',
        cals: 140,
        protein: 3,
        carbs: 32,
        fats: 1,
        icon: 'nutrition-outline',
      },
      {
        id: 'wed-m4',
        name: 'High-Protein Lunch',
        time: '01:30 PM',
        description: 'Pan-seared salmon fillet (180g) or chana masala + 1 cup steamed quinoa + beetroot & rocket salad.',
        cals: 650,
        protein: 52,
        carbs: 54,
        fats: 18,
        icon: 'restaurant-outline',
      },
      {
        id: 'wed-m5',
        name: 'Evening Snack',
        time: '05:30 PM',
        description: 'Low-fat Greek yogurt cup with 1 tsp ground flaxseeds & sliced strawberries.',
        cals: 210,
        protein: 18,
        carbs: 20,
        fats: 5,
        icon: 'flash-outline',
      },
      {
        id: 'wed-m6',
        name: 'Dinner',
        time: '08:30 PM',
        description: 'Stir-fried chicken breast strips (or grilled paneer) with zucchini, snow peas & bok choy in sesame oil.',
        cals: 530,
        protein: 45,
        carbs: 34,
        fats: 15,
        icon: 'moon-outline',
      },
    ],
  },
  Thursday: {
    day: 'Thursday',
    focus: 'Lean Carb Cycling & Sustained Energy',
    meals: [
      {
        id: 'thu-m1',
        name: 'Morning Hydration',
        time: '06:00 AM',
        description: 'Warm water with 1 tbsp raw apple cider vinegar + 2 Medjool dates + 4 walnut halves.',
        cals: 160,
        protein: 4,
        carbs: 26,
        fats: 6,
        icon: 'sunny-outline',
      },
      {
        id: 'thu-m2',
        name: 'Breakfast',
        time: '08:00 AM',
        description: 'High-protein smoothie bowl: unsweetened almond milk, ripe banana, spinach & whey protein isolate.',
        cals: 490,
        protein: 36,
        carbs: 52,
        fats: 12,
        icon: 'cafe-outline',
      },
      {
        id: 'thu-m3',
        name: 'Mid-Morning Snack',
        time: '11:00 AM',
        description: 'Crisp cucumber & carrot crudités with 3 tbsp roasted red pepper hummus dip.',
        cals: 160,
        protein: 6,
        carbs: 20,
        fats: 7,
        icon: 'nutrition-outline',
      },
      {
        id: 'thu-m4',
        name: 'High-Protein Lunch',
        time: '01:30 PM',
        description: 'Lemon-rosemary grilled chicken thigh (200g) or spiced vegetable khichdi + roasted zucchini & low-fat curd.',
        cals: 620,
        protein: 48,
        carbs: 55,
        fats: 16,
        icon: 'restaurant-outline',
      },
      {
        id: 'thu-m5',
        name: 'Evening Snack',
        time: '05:30 PM',
        description: 'Roasted fox nuts (makhana) lightly seasoned with pink salt + antioxidant green tea.',
        cals: 190,
        protein: 8,
        carbs: 28,
        fats: 4,
        icon: 'flash-outline',
      },
      {
        id: 'thu-m6',
        name: 'Dinner',
        time: '08:30 PM',
        description: 'Steamed white cod fillet (or grilled paneer steaks) + hearty vegetable minestrone soup + French beans.',
        cals: 500,
        protein: 50,
        carbs: 24,
        fats: 14,
        icon: 'moon-outline',
      },
    ],
  },
  Friday: {
    day: 'Friday',
    focus: 'Peak Performance & Glycogen Replenishment',
    meals: [
      {
        id: 'fri-m1',
        name: 'Early Morning Hydration',
        time: '07:00 AM',
        description: 'Freshly brewed organic green tea + 5 soaked almonds & 1 small banana.',
        cals: 90,
        protein: 2,
        carbs: 15,
        fats: 2,
        icon: 'sunny-outline',
      },
      {
        id: 'fri-m2',
        name: 'Breakfast',
        time: '08:30 AM',
        description: 'Poached eggs (3 eggs) or smashed spiced tofu on toasted artisan sourdough with grilled cherry tomatoes.',
        cals: 490,
        protein: 32,
        carbs: 45,
        fats: 18,
        icon: 'cafe-outline',
      },
      {
        id: 'fri-m3',
        name: 'High-Protein Lunch',
        time: '01:30 PM',
        description: 'Chicken & bell pepper fajita bowl (or black bean & sweet corn fajita bowl) with 1 cup wild brown rice & pico de gallo.',
        cals: 650,
        protein: 50,
        carbs: 65,
        fats: 16,
        icon: 'restaurant-outline',
      },
      {
        id: 'fri-m4',
        name: 'Evening / Pre-Workout Snack',
        time: '05:00 PM',
        description: '3 boiled egg whites sprinkled with black pepper (or roasted chana & sunflower seed mix) + iced peppermint tea.',
        cals: 220,
        protein: 15,
        carbs: 20,
        fats: 5,
        icon: 'nutrition-outline',
      },
      {
        id: 'fri-m5',
        name: 'Dinner',
        time: '08:30 PM',
        description: 'Pan-seared tuna or tilapia steak (or Thai tofu & broccoli red curry) + cauliflower rice tossed with fresh herbs.',
        cals: 450,
        protein: 42,
        carbs: 30,
        fats: 14,
        icon: 'moon-outline',
      },
    ],
  },
  Saturday: {
    day: 'Saturday',
    focus: 'Weekend Vitality & Clean Refuel',
    meals: [
      {
        id: 'sat-m1',
        name: 'Morning Hydration',
        time: '06:30 AM',
        description: 'Warm water with fresh lemon juice + 1 crisp apple with 1 tbsp creamy peanut butter.',
        cals: 180,
        protein: 5,
        carbs: 25,
        fats: 8,
        icon: 'sunny-outline',
      },
      {
        id: 'sat-m2',
        name: 'Breakfast',
        time: '08:30 AM',
        description: 'Protein oat pancakes (oats, banana, egg whites) topped with fresh blueberries & 1 tsp pure raw honey.',
        cals: 530,
        protein: 36,
        carbs: 65,
        fats: 12,
        icon: 'cafe-outline',
      },
      {
        id: 'sat-m3',
        name: 'Mid-Morning Snack',
        time: '11:30 AM',
        description: 'Fresh tender coconut water with soft coconut meat + pumpkin seeds.',
        cals: 160,
        protein: 4,
        carbs: 22,
        fats: 6,
        icon: 'nutrition-outline',
      },
      {
        id: 'sat-m4',
        name: 'High-Protein Lunch',
        time: '01:30 PM',
        description: 'Mediterranean grilled chicken wrap in whole-wheat tortilla with cucumber-tomato tabbouleh & tzatziki.',
        cals: 650,
        protein: 52,
        carbs: 58,
        fats: 18,
        icon: 'restaurant-outline',
      },
      {
        id: 'sat-m5',
        name: 'Evening Snack',
        time: '05:30 PM',
        description: 'Steamed edamame pods tossed with sea salt & pepper + iced unsweetened green tea.',
        cals: 210,
        protein: 17,
        carbs: 16,
        fats: 6,
        icon: 'flash-outline',
      },
      {
        id: 'sat-m6',
        name: 'Dinner',
        time: '08:30 PM',
        description: 'Herb-roasted chicken breast + baked sweet potato wedges + grilled asparagus spears.',
        cals: 550,
        protein: 48,
        carbs: 44,
        fats: 13,
        icon: 'moon-outline',
      },
    ],
  },
  Sunday: {
    day: 'Sunday',
    focus: 'Gut Reset & Active Recovery Nutrition',
    meals: [
      {
        id: 'sun-m1',
        name: 'Morning Hydration',
        time: '07:00 AM',
        description: 'Warm water infused with fresh mint leaves and lemon slices + chamomile tea.',
        cals: 60,
        protein: 1,
        carbs: 12,
        fats: 1,
        icon: 'sunny-outline',
      },
      {
        id: 'sun-m2',
        name: 'Breakfast',
        time: '09:00 AM',
        description: 'Traditional Shakshuka (3 poached eggs in rich tomato, pepper & cumin sauce) + 1 slice multigrain toast.',
        cals: 480,
        protein: 28,
        carbs: 40,
        fats: 20,
        icon: 'cafe-outline',
      },
      {
        id: 'sun-m3',
        name: 'Mid-Morning Snack',
        time: '11:30 AM',
        description: '1 whole fresh ruby pomegranate or 2 peeled golden kiwis.',
        cals: 130,
        protein: 2,
        carbs: 30,
        fats: 1,
        icon: 'nutrition-outline',
      },
      {
        id: 'sun-m4',
        name: 'High-Protein Lunch',
        time: '01:30 PM',
        description: 'Herb-infused roasted chicken breast (or dal tadka with paneer) + 1 cup steamed basmati rice + cucumber raita.',
        cals: 620,
        protein: 46,
        carbs: 58,
        fats: 15,
        icon: 'restaurant-outline',
      },
      {
        id: 'sun-m5',
        name: 'Evening Snack',
        time: '05:30 PM',
        description: 'Antioxidant trail mix (almonds, walnuts, dried cranberries, pumpkin seeds) + herbal tea.',
        cals: 230,
        protein: 8,
        carbs: 22,
        fats: 14,
        icon: 'flash-outline',
      },
      {
        id: 'sun-m6',
        name: 'Dinner',
        time: '08:30 PM',
        description: 'Grilled white fish fillet (or vegetable red lentil stew) + steamed broccoli + warm turmeric golden milk.',
        cals: 480,
        protein: 44,
        carbs: 30,
        fats: 12,
        icon: 'moon-outline',
      },
    ],
  },
};

const DEFAULT_FRIDAY_MEALS: Meal[] = WEEKLY_DIET_SCHEDULE.Friday.meals;

const DIET_DAYS = [
  { day: 'Monday', cals: '2150 kcal', meals: 6 },
  { day: 'Tuesday', cals: '2200 kcal', meals: 6 },
  { day: 'Wednesday', cals: '2180 kcal', meals: 6 },
  { day: 'Thursday', cals: '2120 kcal', meals: 6 },
  { day: 'Friday', cals: '2240 kcal', meals: 5, isToday: true },
  { day: 'Saturday', cals: '2280 kcal', meals: 6 },
  { day: 'Sunday', cals: '2100 kcal', meals: 6 },
];

export const CustomerDietScreen: React.FC = () => {
  const { user } = useAuth();
  const [selectedDay, setSelectedDay] = useState<string>('Friday');
  const [completedMealIds, setCompletedMealIds] = useState<Set<string>>(new Set());
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 500);
  };

  const currentSchedule = WEEKLY_DIET_SCHEDULE[selectedDay] || WEEKLY_DIET_SCHEDULE.Friday;
  const currentMeals = currentSchedule.meals;

  const handleToggleMeal = (id: string) => {
    setCompletedMealIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleMarkAllEaten = () => {
    const all = new Set(currentMeals.map(m => m.id));
    setCompletedMealIds(all);
    Alert.alert('All Meals Completed! 🥗', `Great job hitting all your meals for ${selectedDay}!`);
  };

  const handleResetDay = () => {
    setCompletedMealIds(new Set());
  };

  // Calculate consumed totals
  const consumedMeals = currentMeals.filter(m => completedMealIds.has(m.id));
  const consumedCals = consumedMeals.reduce((acc, m) => acc + m.cals, 0);
  const consumedProtein = consumedMeals.reduce((acc, m) => acc + m.protein, 0);
  const consumedCarbs = consumedMeals.reduce((acc, m) => acc + m.carbs, 0);
  const consumedFats = consumedMeals.reduce((acc, m) => acc + m.fats, 0);

  const totalCals = currentMeals.reduce((acc, m) => acc + m.cals, 0);
  const totalProtein = currentMeals.reduce((acc, m) => acc + m.protein, 0);
  const totalCarbs = currentMeals.reduce((acc, m) => acc + m.carbs, 0);
  const totalFats = currentMeals.reduce((acc, m) => acc + m.fats, 0);

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
    >
      {/* ======================================================== */}
      {/* 1. TOP HEADER & TRAINER BADGE (Matching Web Page 6) */}
      {/* ======================================================== */}
      <View style={styles.topHeaderCard}>
        <View style={styles.headerTitleRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.mainTitle}>Your Diet Plan</Text>
            <Text style={styles.daysBadgeSubtitle}>Monday - Sunday</Text>
            <Text style={styles.mainSub}>
              Fuel your body with tailored, non-repeating daily meals from Monday to Sunday. Click any meal to mark it completed.
            </Text>
          </View>
        </View>

        {/* Action Controls: Mark All Eaten & Reset Day */}
        <View style={styles.actionBtnsRow}>
          <TouchableOpacity 
            style={styles.markAllBtn}
            onPress={handleMarkAllEaten}
            activeOpacity={0.7}
          >
            <Ionicons name="checkmark-done" size={14} color="#EA580C" />
            <Text style={styles.markAllBtnText}>Mark All Eaten</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.resetBtn}
            onPress={handleResetDay}
            activeOpacity={0.7}
          >
            <Ionicons name="refresh" size={14} color="#64748B" />
            <Text style={styles.resetBtnText}>Reset Day</Text>
          </TouchableOpacity>
        </View>

        {/* Coach Approved Tag & Coach Notes */}
        <View style={styles.approvedCoachRow}>
          <View style={styles.approvedPill}>
            <Ionicons name="shield-checkmark" size={13} color="#16A34A" />
            <Text style={styles.approvedPillText}>APPROVED BY TRAINER</Text>
          </View>
          <Text style={styles.coachNameText}>Coach: Naveen</Text>
          <Text style={styles.targetPlanText}>Target: Weight Loss</Text>
        </View>

        <View style={styles.coachNotesBox}>
          <Text style={styles.coachNotesLabel}>Coach Notes:</Text>
          <Text style={styles.coachNotesText}>"Stay hydrated and avoid high sodium post 8 PM. Keep up the high protein intake!"</Text>
        </View>
      </View>

      {/* ======================================================== */}
      {/* 2. 4 TARGET MACRO CARDS (Matching Web Page 6 Top) */}
      {/* ======================================================== */}
      <View style={styles.macroCardsGrid}>
        <View style={styles.macroCard}>
          <Ionicons name="flame" size={18} color="#EA580C" />
          <Text style={styles.macroVal}>2,240 kcal</Text>
          <Text style={styles.macroLabel}>DAILY TARGET</Text>
        </View>

        <View style={styles.macroCard}>
          <Ionicons name="barbell-outline" size={18} color="#2563EB" />
          <Text style={styles.macroVal}>158g</Text>
          <Text style={styles.macroLabel}>PROTEIN</Text>
        </View>

        <View style={styles.macroCard}>
          <Ionicons name="leaf-outline" size={18} color="#F59E0B" />
          <Text style={styles.macroVal}>220g</Text>
          <Text style={styles.macroLabel}>CARBOHYDRATES</Text>
        </View>

        <View style={styles.macroCard}>
          <Ionicons name="water-outline" size={18} color="#06B6D4" />
          <Text style={styles.macroVal}>3.5 - 4.0 L</Text>
          <Text style={styles.macroLabel}>HYDRATION / DAY</Text>
        </View>
      </View>

      {/* ======================================================== */}
      {/* 3. DAY SELECTOR (Matching Web Page 6 Middle) */}
      {/* ======================================================== */}
      <View style={styles.daySelectorHeader}>
        <Text style={styles.daySelectorTitle}>SELECT DAY OF THE WEEK</Text>
        <Text style={styles.daySelectorViewing}>Currently Viewing: {selectedDay}</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.daysScroll}>
        {DIET_DAYS.map(d => {
          const isSelected = selectedDay === d.day;
          return (
            <TouchableOpacity
              key={d.day}
              style={[styles.dietDayCard, isSelected && styles.dietDayCardActive]}
              onPress={() => setSelectedDay(d.day)}
              activeOpacity={0.7}
            >
              {d.isToday && (
                <View style={styles.todayPill}>
                  <Text style={styles.todayPillText}>TODAY</Text>
                </View>
              )}
              <Text style={[styles.dietDayName, isSelected && styles.dietDayNameActive]}>{d.day}</Text>
              <Text style={[styles.dietDayCals, isSelected && styles.dietDayCalsActive]}>{d.cals}</Text>
              <Text style={[styles.dietDayMeals, isSelected && styles.dietDayMealsActive]}>{d.meals} meals</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* ======================================================== */}
      {/* 4. MACRO PROGRESS BARS (Matching Web Page 6) */}
      {/* ======================================================== */}
      <View style={styles.progressBarsCard}>
        <View style={styles.progressGrid}>
          {/* Calories */}
          <View style={styles.progressCol}>
            <Text style={styles.progressLabel}>Calories</Text>
            <Text style={styles.progressNumbers}>{consumedCals} / {totalCals} kcal</Text>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${Math.min(100, (consumedCals / totalCals) * 100)}%`, backgroundColor: '#EA580C' }]} />
            </View>
            <Text style={styles.progressPercent}>{Math.round((consumedCals / totalCals) * 100)}% consumed</Text>
          </View>

          {/* Protein */}
          <View style={styles.progressCol}>
            <Text style={styles.progressLabel}>Protein</Text>
            <Text style={styles.progressNumbers}>{consumedProtein} / {totalProtein}g</Text>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${Math.min(100, (consumedProtein / totalProtein) * 100)}%`, backgroundColor: '#2563EB' }]} />
            </View>
            <Text style={styles.progressPercent}>{Math.round((consumedProtein / totalProtein) * 100)}% consumed</Text>
          </View>

          {/* Carbs */}
          <View style={styles.progressCol}>
            <Text style={styles.progressLabel}>Carbs</Text>
            <Text style={styles.progressNumbers}>{consumedCarbs} / {totalCarbs}g</Text>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${Math.min(100, (consumedCarbs / totalCarbs) * 100)}%`, backgroundColor: '#F59E0B' }]} />
            </View>
            <Text style={styles.progressPercent}>{Math.round((consumedCarbs / totalCarbs) * 100)}% consumed</Text>
          </View>

          {/* Fats */}
          <View style={styles.progressCol}>
            <Text style={styles.progressLabel}>Fats</Text>
            <Text style={styles.progressNumbers}>{consumedFats} / {totalFats}g</Text>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${Math.min(100, (consumedFats / totalFats) * 100)}%`, backgroundColor: '#06B6D4' }]} />
            </View>
            <Text style={styles.progressPercent}>{Math.round((consumedFats / totalFats) * 100)}% consumed</Text>
          </View>
        </View>
      </View>

      {/* ======================================================== */}
      {/* 5. MEALS SCHEDULE (Matching Web Page 7 Exactly) */}
      {/* ======================================================== */}
      <View style={styles.scheduleHeaderRow}>
        <View>
          <Text style={styles.scheduleHeaderTitle}>{selectedDay}'s Meal Schedule</Text>
          <Text style={styles.scheduleHeaderSub}>{currentSchedule.focus} • Click any meal to mark it eaten</Text>
        </View>
        <Text style={styles.completedCountText}>
          {completedMealIds.size} of {currentMeals.length} Completed ({Math.round((completedMealIds.size / (currentMeals.length || 1)) * 100)}%)
        </Text>
      </View>

      <View style={{ gap: 12 }}>
        {currentMeals.map((meal) => {
          const isDone = completedMealIds.has(meal.id);
          return (
            <TouchableOpacity
              key={meal.id}
              style={[styles.mealCard, isDone && styles.mealCardDone]}
              onPress={() => handleToggleMeal(meal.id)}
              activeOpacity={0.8}
            >
              {/* Top Row: Title, Time & Checkbox */}
              <View style={styles.mealTopRow}>
                <View style={styles.mealIconCircle}>
                  <Ionicons name={meal.icon as any} size={18} color="#EA580C" />
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={[styles.mealNameText, isDone && styles.mealNameDone]}>{meal.name}</Text>
                  <Text style={styles.mealTimeText}>{meal.time}</Text>
                </View>
                <Ionicons 
                  name={isDone ? "checkbox" : "square-outline"} 
                  size={24} 
                  color={isDone ? "#16A34A" : "#94A3B8"} 
                />
              </View>

              {/* Description */}
              <Text style={styles.mealDescText}>• {meal.description}</Text>

              {/* Macros Row */}
              <View style={styles.mealMacrosRow}>
                <View style={styles.macroPill}>
                  <Ionicons name="flame" size={12} color="#EA580C" />
                  <Text style={styles.macroPillText}>{meal.cals} kcal</Text>
                </View>

                <View style={styles.macroPill}>
                  <Ionicons name="barbell" size={12} color="#2563EB" />
                  <Text style={styles.macroPillText}>{meal.protein}g protein</Text>
                </View>

                <View style={styles.macroPill}>
                  <Ionicons name="leaf" size={12} color="#F59E0B" />
                  <Text style={styles.macroPillText}>{meal.carbs}g carbs</Text>
                </View>

                <View style={styles.macroPill}>
                  <Ionicons name="water" size={12} color="#06B6D4" />
                  <Text style={styles.macroPillText}>{meal.fats}g fats</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { padding: 14, paddingBottom: 100 },

  // Top Header Card Matching Web Page 6
  topHeaderCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  headerTitleRow: {
    marginBottom: 10,
  },
  mainTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#111827',
  },
  daysBadgeSubtitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EA580C',
    marginTop: 2,
  },
  mainSub: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 17,
    marginTop: 4,
  },
  actionBtnsRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 10,
  },
  markAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FDBA74',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  markAllBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#EA580C',
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  resetBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  approvedCoachRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  approvedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  approvedPillText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#16A34A',
  },
  coachNameText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  targetPlanText: {
    fontSize: 11,
    color: '#EA580C',
    fontWeight: '700',
  },
  coachNotesBox: {
    backgroundColor: '#FFF7ED',
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
  },
  coachNotesLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#9A3412',
    marginBottom: 2,
  },
  coachNotesText: {
    fontSize: 11,
    color: '#431407',
    fontStyle: 'italic',
    lineHeight: 16,
  },

  // 4 Target Macro Cards
  macroCardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  macroCard: {
    width: '48.5%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
  },
  macroVal: {
    fontSize: 15,
    fontWeight: '900',
    color: '#111827',
    marginTop: 4,
  },
  macroLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
    marginTop: 2,
    letterSpacing: 0.4,
  },

  // Day Selector
  daySelectorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  daySelectorTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  daySelectorViewing: {
    fontSize: 11,
    fontWeight: '700',
    color: '#EA580C',
  },
  daysScroll: {
    gap: 8,
    marginBottom: 14,
  },
  dietDayCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: 'center',
    minWidth: 85,
    position: 'relative',
  },
  dietDayCardActive: {
    backgroundColor: '#EA580C',
    borderColor: '#EA580C',
  },
  todayPill: {
    position: 'absolute',
    top: -6,
    backgroundColor: '#C2410C',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  todayPillText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  dietDayName: {
    fontSize: 12,
    fontWeight: '800',
    color: '#111827',
    marginTop: 4,
  },
  dietDayNameActive: { color: '#FFFFFF' },
  dietDayCals: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
  dietDayCalsActive: { color: 'rgba(255, 255, 255, 0.85)' },
  dietDayMeals: {
    fontSize: 9,
    fontWeight: '700',
    color: '#EA580C',
    marginTop: 2,
  },
  dietDayMealsActive: { color: '#FFFFFF' },

  // Macro Progress Bars
  progressBarsCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
  },
  progressGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  progressCol: {
    width: '47%',
  },
  progressLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  progressNumbers: {
    fontSize: 11,
    fontWeight: '800',
    color: '#111827',
    marginTop: 2,
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F1F5F9',
    marginTop: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
  },
  progressPercent: {
    fontSize: 9,
    color: '#94A3B8',
    marginTop: 2,
  },

  // Meals Schedule
  scheduleHeaderRow: {
    marginBottom: 10,
  },
  scheduleHeaderTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
  },
  scheduleHeaderSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  completedCountText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#16A34A',
    marginTop: 4,
  },
  mealCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 14,
  },
  mealCardDone: {
    borderColor: '#BBF7D0',
    backgroundColor: '#F0FDF4',
  },
  mealTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mealIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mealNameText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
  },
  mealNameDone: {
    textDecorationLine: 'line-through',
    color: '#16A34A',
  },
  mealTimeText: {
    fontSize: 11,
    color: '#64748B',
  },
  mealDescText: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
    marginTop: 8,
  },
  mealMacrosRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
  },
  macroPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  macroPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#334155',
  },
});
