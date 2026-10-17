import { Response } from 'express';
import DietProgress from '../models/DietProgress';
import User, { Role } from '../models/User';
import Gym from '../models/Gym';
import Trainer from '../models/Trainer';
import AIRecommendation from '../models/AIRecommendation';
import { AuthRequest } from '../middlewares/auth';
import mongoose from 'mongoose';

const DAYS_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const DEFAULT_WEEKLY_DIET_PLAN: Record<string, {
  day: string;
  focus: string;
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFats: number;
  meals: Array<{
    id: number;
    time: string;
    type: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    items: string[];
  }>;
}> = {
  Monday: {
    day: 'Monday',
    focus: 'Lean Muscle & Metabolic Activation',
    targetCalories: 2150,
    targetProtein: 155,
    targetCarbs: 210,
    targetFats: 58,
    meals: [
      { id: 1, time: '07:00 AM', type: 'Early Morning Hydration', calories: 90, protein: 3, carbs: 15, fats: 2, items: ['Warm lemon & ginger water (500ml)', '5 soaked almonds', '1 tsp chia seeds'] },
      { id: 2, time: '08:30 AM', type: 'Breakfast', calories: 450, protein: 32, carbs: 45, fats: 14, items: ['3 Scrambled Eggs with spinach & mushrooms', '2 slices whole-wheat artisan bread', 'Black Coffee'] },
      { id: 3, time: '11:00 AM', type: 'Mid-Morning Snack', calories: 160, protein: 10, carbs: 22, fats: 3, items: ['1 crisp green apple', '1 cup low-fat Greek yogurt'] },
      { id: 4, time: '01:30 PM', type: 'High-Protein Lunch', calories: 650, protein: 50, carbs: 65, fats: 18, items: ['Grilled chicken breast (180g)', '1 cup brown rice', 'Steamed broccoli & carrots with olive oil'] },
      { id: 5, time: '05:00 PM', type: 'Evening / Pre-Workout Snack', calories: 220, protein: 15, carbs: 26, fats: 5, items: ['1 scoop Whey Protein Isolate with cold water', 'Handful of roasted chana'] },
      { id: 6, time: '08:30 PM', type: 'Recovery Dinner', calories: 530, protein: 45, carbs: 38, fats: 16, items: ['Baked salmon fillet (160g)', 'Small baked sweet potato', 'Mixed garden salad'] }
    ]
  },
  Tuesday: {
    day: 'Tuesday',
    focus: 'Strength Fuel & High-Fiber Endurance',
    targetCalories: 2200,
    targetProtein: 155,
    targetCarbs: 215,
    targetFats: 60,
    meals: [
      { id: 1, time: '07:00 AM', type: 'Early Morning Hydration', calories: 100, protein: 2, carbs: 18, fats: 2, items: ['Warm water with pink salt & chia seeds', '2 rice cakes with almond butter'] },
      { id: 2, time: '08:30 AM', type: 'Breakfast', calories: 460, protein: 30, carbs: 55, fats: 12, items: ['Rolled oats porridge in almond milk with blueberries', '1 scoop protein powder'] },
      { id: 3, time: '11:00 AM', type: 'Mid-Morning Snack', calories: 180, protein: 6, carbs: 16, fats: 10, items: ['Raw walnuts (30g) and golden raisins', 'Green tea'] },
      { id: 4, time: '01:30 PM', type: 'High-Protein Lunch', calories: 660, protein: 52, carbs: 68, fats: 18, items: ['Shredded chicken quinoa bowl (or rajma bowl)', 'Avocado, cherry tomatoes, lime vinaigrette'] },
      { id: 5, time: '05:00 PM', type: 'Evening / Pre-Workout Snack', calories: 210, protein: 12, carbs: 30, fats: 4, items: ['Sprouted moong bean salad with diced cucumbers & tomatoes', 'Lemon chaat masala'] },
      { id: 6, time: '08:30 PM', type: 'Recovery Dinner', calories: 550, protein: 48, carbs: 40, fats: 15, items: ['Grilled lemon-herb chicken skewers', 'Sautéed asparagus & baby spinach', 'Vegetable broth soup'] }
    ]
  },
  Wednesday: {
    day: 'Wednesday',
    focus: 'Cellular Repair & Anti-Inflammatory Nutrition',
    targetCalories: 2180,
    targetProtein: 160,
    targetCarbs: 200,
    targetFats: 62,
    meals: [
      { id: 1, time: '07:00 AM', type: 'Early Morning Hydration', calories: 110, protein: 3, carbs: 14, fats: 5, items: ['Warm fenugreek water (500ml)', '1 slice whole-grain toast with mashed avocado'] },
      { id: 2, time: '08:30 AM', type: 'Breakfast', calories: 440, protein: 34, carbs: 42, fats: 14, items: ['Egg-white omelette (4 whites, 1 yolk) with peppers', '1 sweet orange', 'Green tea'] },
      { id: 3, time: '11:00 AM', type: 'Mid-Morning Snack', calories: 150, protein: 2, carbs: 32, fats: 1, items: ['Fresh cubed papaya or chilled watermelon', 'Mint infused water'] },
      { id: 4, time: '01:30 PM', type: 'High-Protein Lunch', calories: 670, protein: 50, carbs: 62, fats: 20, items: ['Pan-seared salmon fillet (180g) or chana masala', '1 cup steamed quinoa', 'Beetroot & rocket salad'] },
      { id: 5, time: '05:00 PM', type: 'Evening / Pre-Workout Snack', calories: 230, protein: 18, carbs: 24, fats: 6, items: ['Low-fat Greek yogurt cup with ground flaxseeds', 'Fresh sliced strawberries'] },
      { id: 6, time: '08:30 PM', type: 'Recovery Dinner', calories: 540, protein: 48, carbs: 36, fats: 17, items: ['Stir-fried chicken breast (or grilled paneer)', 'Zucchini, snow peas & bok choy in sesame oil'] }
    ]
  },
  Thursday: {
    day: 'Thursday',
    focus: 'Lean Carb Cycling & Sustained Energy',
    targetCalories: 2120,
    targetProtein: 152,
    targetCarbs: 205,
    targetFats: 59,
    meals: [
      { id: 1, time: '07:00 AM', type: 'Early Morning Hydration', calories: 130, protein: 3, carbs: 22, fats: 4, items: ['Warm water with apple cider vinegar', '2 Medjool dates + 4 walnut halves'] },
      { id: 2, time: '08:30 AM', type: 'Breakfast', calories: 430, protein: 36, carbs: 50, fats: 10, items: ['High-Protein Smoothie Bowl (banana, spinach, whey isolate)', 'Pumpkin seeds & coconut flakes'] },
      { id: 3, time: '11:00 AM', type: 'Mid-Morning Snack', calories: 160, protein: 6, carbs: 18, fats: 8, items: ['Cucumber & carrot crudités', '3 tbsp roasted red pepper hummus'] },
      { id: 4, time: '01:30 PM', type: 'High-Protein Lunch', calories: 660, protein: 50, carbs: 60, fats: 20, items: ['Lemon-rosemary grilled chicken thigh (200g)', 'Roasted zucchini & low-fat curd (dahi)'] },
      { id: 5, time: '05:00 PM', type: 'Evening / Pre-Workout Snack', calories: 200, protein: 8, carbs: 32, fats: 4, items: ['Roasted fox nuts (makhana) with pink salt', 'Hot antioxidant green tea'] },
      { id: 6, time: '08:30 PM', type: 'Recovery Dinner', calories: 540, protein: 49, carbs: 36, fats: 16, items: ['Steamed white cod fillet (or paneer steaks)', 'Hearty vegetable minestrone soup'] }
    ]
  },
  Friday: {
    day: 'Friday',
    focus: 'Peak Performance & Glycogen Replenishment',
    targetCalories: 2240,
    targetProtein: 158,
    targetCarbs: 220,
    targetFats: 64,
    meals: [
      { id: 1, time: '07:00 AM', type: 'Early Morning Hydration', calories: 110, protein: 3, carbs: 18, fats: 3, items: ['Fresh green tea + 5 soaked almonds', '1 small banana'] },
      { id: 2, time: '08:30 AM', type: 'Breakfast', calories: 470, protein: 32, carbs: 48, fats: 16, items: ['Poached eggs (3 eggs) on sourdough toast', 'Grilled cherry tomatoes'] },
      { id: 3, time: '11:00 AM', type: 'Mid-Morning Snack', calories: 160, protein: 3, carbs: 28, fats: 2, items: ['1 whole fresh pear or guava slices', 'Electrolyte water'] },
      { id: 4, time: '01:30 PM', type: 'High-Protein Lunch', calories: 680, protein: 54, carbs: 70, fats: 18, items: ['Chicken & bell pepper fajita bowl', '1 cup wild brown rice & pico de gallo'] },
      { id: 5, time: '05:00 PM', type: 'Evening / Pre-Workout Snack', calories: 220, protein: 16, carbs: 22, fats: 6, items: ['3 boiled egg whites with black pepper', 'Roasted chana + iced peppermint tea'] },
      { id: 6, time: '08:30 PM', type: 'Recovery Dinner', calories: 560, protein: 50, carbs: 38, fats: 18, items: ['Pan-seared tuna or tilapia steak', 'Cauliflower rice with fresh herbs'] }
    ]
  },
  Saturday: {
    day: 'Saturday',
    focus: 'Weekend Vitality & Clean Refuel',
    targetCalories: 2280,
    targetProtein: 162,
    targetCarbs: 230,
    targetFats: 63,
    meals: [
      { id: 1, time: '07:00 AM', type: 'Early Morning Hydration', calories: 90, protein: 2, carbs: 16, fats: 2, items: ['Warm water with lime & raw honey', '4 soaked almonds'] },
      { id: 2, time: '08:30 AM', type: 'Breakfast', calories: 480, protein: 34, carbs: 54, fats: 14, items: ['Protein pancake stack (oats, banana, whey)', 'Pure maple syrup drizzle'] },
      { id: 3, time: '11:00 AM', type: 'Mid-Morning Snack', calories: 170, protein: 5, carbs: 26, fats: 5, items: ['Fresh orange & mixed berries', 'Pumpkin seeds'] },
      { id: 4, time: '01:30 PM', type: 'High-Protein Lunch', calories: 690, protein: 52, carbs: 72, fats: 19, items: ['Mediterranean grilled turkey/soy patties', 'Whole wheat pita with tzatziki & romaine'] },
      { id: 5, time: '05:00 PM', type: 'Evening / Pre-Workout Snack', calories: 210, protein: 12, carbs: 30, fats: 4, items: ['Antioxidant green smoothie (spinach, apple, cucumber, coconut water)'] },
      { id: 6, time: '08:30 PM', type: 'Recovery Dinner', calories: 570, protein: 50, carbs: 42, fats: 18, items: ['Grilled lemon-garlic jumbo shrimp or herbed tofu', 'Roasted sweet potato wedges & carrots'] }
    ]
  },
  Sunday: {
    day: 'Sunday',
    focus: 'Gut Reset & Active Recovery Nutrition',
    targetCalories: 2100,
    targetProtein: 148,
    targetCarbs: 200,
    targetFats: 58,
    meals: [
      { id: 1, time: '07:30 AM', type: 'Early Morning Hydration', calories: 50, protein: 1, carbs: 9, fats: 0, items: ['Warm water with mint & lemon slices', 'Chamomile herbal infusion'] },
      { id: 2, time: '09:00 AM', type: 'Breakfast', calories: 430, protein: 28, carbs: 40, fats: 17, items: ['Traditional Shakshuka (3 poached eggs in spiced tomato sauce)', '1 slice artisan toast'] },
      { id: 3, time: '11:30 AM', type: 'Mid-Morning Snack', calories: 140, protein: 3, carbs: 31, fats: 1, items: ['Ruby pomegranate or golden kiwis', 'Refreshing mint & cucumber water'] },
      { id: 4, time: '01:30 PM', type: 'High-Protein Lunch', calories: 630, protein: 48, carbs: 65, fats: 16, items: ['Herb-roasted chicken breast or Dal Tadka with paneer', '1 cup steamed basmati rice & cucumber raita'] },
      { id: 5, time: '05:00 PM', type: 'Evening Snack', calories: 220, protein: 8, carbs: 18, fats: 15, items: ['Antioxidant trail mix (almonds, walnuts, cranberries)', 'Warm detox tea'] },
      { id: 6, time: '08:30 PM', type: 'Recovery Dinner', calories: 530, protein: 46, carbs: 37, fats: 16, items: ['Grilled white fish fillet (or red lentil stew)', 'Steamed broccoli, carrots in clear broth', 'Turmeric golden milk'] }
    ]
  }
};

// 1. Log or Toggle Single Meal (Customer)
export const toggleMealProgress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const {
      dayName,
      mealId,
      mealType,
      items,
      calories,
      protein,
      carbs,
      fats,
      completed
    } = req.body;

    if (!dayName || mealId === undefined) {
      res.status(400).json({ success: false, message: 'dayName and mealId are required' });
      return;
    }

    // Resolve gym and trainer
    let gymId: any = user.gymId;
    let trainerId: any = undefined;
    try {
      const userDoc = await User.findById(user.id).select('gymId assignedTrainer');
      if (userDoc?.gymId) gymId = userDoc.gymId;
      if (userDoc?.assignedTrainer) trainerId = userDoc.assignedTrainer;
    } catch (err) {
      // non-blocking
    }

    if (!gymId) {
      const anyGym = await Gym.findOne().select('_id');
      gymId = anyGym?._id;
    }

    const isCompleted = completed !== false;
    const customerObjId = new mongoose.Types.ObjectId(String(user.id));

    const progress = await DietProgress.findOneAndUpdate(
      { customerId: customerObjId, dayName, mealId },
      {
        customerId: customerObjId,
        gymId: gymId || undefined,
        trainerId: trainerId || undefined,
        dayName,
        mealId: Number(mealId),
        mealType: mealType || 'Meal',
        items: Array.isArray(items) ? items : [items].filter(Boolean),
        calories: Number(calories) || 0,
        protein: Number(protein) || 0,
        carbs: Number(carbs) || 0,
        fats: Number(fats) || 0,
        completed: isCompleted,
        completedAt: isCompleted ? new Date() : undefined
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({
      success: true,
      message: isCompleted ? 'Meal marked as completed' : 'Meal marked as incomplete',
      progress
    });
  } catch (error: any) {
    console.error('Error toggling diet progress:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// 2. Batch Log All Meals for Day (Customer)
export const batchLogDayMeals = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { dayName, meals } = req.body;
    if (!dayName || !Array.isArray(meals)) {
      res.status(400).json({ success: false, message: 'dayName and meals array are required' });
      return;
    }

    let gymId: any = user.gymId;
    let trainerId: any = undefined;
    try {
      const userDoc = await User.findById(user.id).select('gymId assignedTrainer');
      if (userDoc?.gymId) gymId = userDoc.gymId;
      if (userDoc?.assignedTrainer) trainerId = userDoc.assignedTrainer;
    } catch (err) {
      // non-blocking
    }

    const customerObjId = new mongoose.Types.ObjectId(String(user.id));

    await Promise.all(
      meals.map((m: any) =>
        DietProgress.findOneAndUpdate(
          { customerId: customerObjId, dayName, mealId: Number(m.id) },
          {
            customerId: customerObjId,
            gymId: gymId || undefined,
            trainerId: trainerId || undefined,
            dayName,
            mealId: Number(m.id),
            mealType: m.type || 'Meal',
            items: Array.isArray(m.items) ? m.items : [m.items].filter(Boolean),
            calories: Number(m.calories) || 0,
            protein: Number(m.protein) || 0,
            carbs: Number(m.carbs) || 0,
            fats: Number(m.fats) || 0,
            completed: true,
            completedAt: new Date()
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        )
      )
    );

    res.status(200).json({
      success: true,
      message: `All meals for ${dayName} marked completed`
    });
  } catch (error: any) {
    console.error('Error batch logging diet progress:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// 3. Reset Day Meals (Customer)
export const resetDayDietMeals = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { dayName } = req.body;
    if (!dayName) {
      res.status(400).json({ success: false, message: 'dayName is required' });
      return;
    }

    const customerObjId = new mongoose.Types.ObjectId(String(user.id));
    await DietProgress.updateMany(
      { customerId: customerObjId, dayName },
      { $set: { completed: false } }
    );

    res.status(200).json({
      success: true,
      message: `Meals for ${dayName} reset`
    });
  } catch (error: any) {
    console.error('Error resetting day diet progress:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// 4. Get My Diet Progress (Customer)
export const getMyDietProgress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const customerObjId = new mongoose.Types.ObjectId(String(user.id));
    const logs = await DietProgress.find({ customerId: customerObjId, completed: true }).sort({ completedAt: -1 });

    const completedMap: Record<string, number[]> = {};
    DAYS_ORDER.forEach(d => {
      completedMap[d] = [];
    });

    logs.forEach(l => {
      if (completedMap[l.dayName]) {
        if (!completedMap[l.dayName].includes(l.mealId)) {
          completedMap[l.dayName].push(l.mealId);
        }
      }
    });

    const overview = await buildCustomerDietOverview(user.id);

    res.status(200).json({
      success: true,
      completedMap,
      logs,
      overview
    });
  } catch (error: any) {
    console.error('Error getting my diet progress:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// Helper: build client diet summary
const buildCustomerDietOverview = async (customerId: string, customerDoc?: any) => {
  let customer = customerDoc;
  if (!customer && customerId && mongoose.Types.ObjectId.isValid(String(customerId))) {
    try {
      customer = await User.findById(customerId).select('firstName lastName email profilePhoto fitnessGoal') as any;
    } catch (err) {
      // non-blocking
    }
  }

  const queryCustId = customerId && mongoose.Types.ObjectId.isValid(String(customerId))
    ? new mongoose.Types.ObjectId(String(customerId))
    : customerId;
  const logs = await DietProgress.find({ customerId: queryCustId, completed: true }).sort({ completedAt: -1 });

  const dayBreakdown: Record<string, any> = {};
  let totalPlannedMeals = 0;
  let totalCompletedMeals = 0;
  let totalCaloriesLogged = 0;
  let totalProteinLogged = 0;

  DAYS_ORDER.forEach(d => {
    const baseDay = DEFAULT_WEEKLY_DIET_PLAN[d];
    const dayLogs = logs.filter(l => l.dayName === d);
    const completedMealIds = new Set(dayLogs.map(l => l.mealId));

    const mealsWithStatus = baseDay.meals.map(m => {
      const isCompleted = completedMealIds.has(m.id);
      const matchingLog = dayLogs.find(l => l.mealId === m.id);
      return {
        ...m,
        completed: isCompleted,
        completedAt: matchingLog?.completedAt || null
      };
    });

    const dayCompletedCount = mealsWithStatus.filter(m => m.completed).length;
    const dayTargetCalories = baseDay.targetCalories;
    const dayConsumedCalories = mealsWithStatus
      .filter(m => m.completed)
      .reduce((sum, m) => sum + m.calories, 0);
    const dayConsumedProtein = mealsWithStatus
      .filter(m => m.completed)
      .reduce((sum, m) => sum + m.protein, 0);

    totalPlannedMeals += baseDay.meals.length;
    totalCompletedMeals += dayCompletedCount;
    totalCaloriesLogged += dayConsumedCalories;
    totalProteinLogged += dayConsumedProtein;

    dayBreakdown[d] = {
      day: d,
      focus: baseDay.focus,
      totalMeals: baseDay.meals.length,
      completedMeals: dayCompletedCount,
      targetCalories: dayTargetCalories,
      consumedCalories: dayConsumedCalories,
      targetProtein: baseDay.targetProtein,
      consumedProtein: dayConsumedProtein,
      completionPercentage: baseDay.meals.length > 0
        ? Math.min(100, Math.round((dayCompletedCount / baseDay.meals.length) * 100))
        : 0,
      meals: mealsWithStatus
    };
  });

  const overallCompletionPercentage = totalPlannedMeals > 0
    ? Math.min(100, Math.round((totalCompletedMeals / totalPlannedMeals) * 100))
    : 0;

  return {
    customer: {
      id: customerId,
      name: customer ? `${customer.firstName || ''} ${customer.lastName || ''}`.trim() : 'Client',
      email: customer?.email || '',
      profilePhoto: customer?.profilePhoto || '',
      fitnessGoal: customer?.fitnessGoal || 'General Fitness'
    },
    plan: {
      id: 'weekly-nutrition-plan',
      name: '7-Day Nutrition & Macro Diet Plan',
      status: overallCompletionPercentage === 100 ? 'Completed' : (totalCompletedMeals > 0 ? 'In Progress' : 'Not Started'),
      totalMeals: totalPlannedMeals
    },
    dayBreakdown,
    stats: {
      totalMealsPlanned: totalPlannedMeals,
      totalMealsCompleted: totalCompletedMeals,
      totalCaloriesLogged,
      totalProteinLogged,
      completionPercentage: overallCompletionPercentage,
      pendingMeals: totalPlannedMeals - totalCompletedMeals
    },
    lastActive: logs[0]?.completedAt || null
  };
};

// 5. Get Trainer Diet Clients Overview (Trainer)
export const getTrainerDietClientsOverview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    let trainerIds: any[] = [user.id];
    try {
      const trainerDoc = await Trainer.findOne({
        $or: [{ userId: user.id }, { _id: user.id }]
      });
      if (trainerDoc) {
        if (trainerDoc._id) trainerIds.push(trainerDoc._id);
        if (trainerDoc.userId) trainerIds.push(trainerDoc.userId);
      }
    } catch (err) {
      // non-blocking
    }

    let gymId: any = user.gymId;
    if (!gymId) {
      try {
        const u = await User.findById(user.id);
        gymId = u?.gymId;
      } catch (err) {
        // non-blocking
      }
    }

    // 1) Assigned users (only role: MEMBER)
    const assignedUsers = await User.find({
      role: Role.MEMBER,
      $or: [
        { assignedTrainer: { $in: trainerIds } },
        ...(gymId ? [{ gymId }] : [])
      ]
    } as any).select('firstName lastName email profilePhoto fitnessGoal assignedTrainer role');

    // 2) DietProgress logs
    const dietLogs = await DietProgress.find({
      $or: [
        { trainerId: { $in: trainerIds } },
        ...(gymId ? [{ gymId }] : [])
      ]
    }).select('customerId completedAt dayName mealType mealId calories protein items completed');

    const customerIdSet = new Set<string>();
    assignedUsers.forEach(u => customerIdSet.add(u._id.toString()));
    dietLogs.forEach(dl => dl.customerId && customerIdSet.add(dl.customerId.toString()));

    if (customerIdSet.size === 0) {
      const anyMembers = await User.find({ role: Role.MEMBER } as any).limit(25);
      anyMembers.forEach(m => customerIdSet.add(m._id.toString()));
    }

    // Verify all candidates have role: Role.MEMBER and are not Arun or Naveen
    const validMembers = await User.find({
      _id: { $in: Array.from(customerIdSet) },
      role: Role.MEMBER
    }).select('firstName lastName email profilePhoto fitnessGoal assignedTrainer role');

    const memberMap = new Map(validMembers.map(m => [m._id.toString(), m]));

    const clients = (await Promise.all(
      Array.from(memberMap.keys()).map(async cid => {
        const userDoc = memberMap.get(cid);
        const name = `${userDoc?.firstName || ''} ${userDoc?.lastName || ''}`.toLowerCase();
        if (name.includes('arun') || name.includes('naveen')) return null;
        return buildCustomerDietOverview(cid, userDoc);
      })
    )).filter(Boolean) as any[];

    // Build Recent Activity (only for members)
    const recentActivity = (await Promise.all(
      dietLogs
        .filter(l => l.completed)
        .slice(0, 15)
        .map(async (l: any) => {
          const u = memberMap.get(l.customerId?.toString());
          if (!u) return null;
          const uName = `${u.firstName || ''} ${u.lastName || ''}`.trim();
          if (uName.toLowerCase().includes('arun') || uName.toLowerCase().includes('naveen')) return null;
          return {
            id: String(l._id),
            customerId: l.customerId,
            customerName: u ? `${u.firstName || ''} ${u.lastName || ''}`.trim() : 'Client',
            customerPhoto: u?.profilePhoto,
            mealType: l.mealType || 'Meal',
            dayName: l.dayName,
            calories: l.calories || 0,
            protein: l.protein || 0,
            completedAt: l.completedAt
          };
        })
    )).filter(Boolean);

    const totalClients = clients.length;
    const avgAdherence = totalClients > 0
      ? Math.round(clients.reduce((acc, c) => acc + c.stats.completionPercentage, 0) / totalClients)
      : 0;
    const totalMealsDone = clients.reduce((acc, c) => acc + c.stats.totalMealsCompleted, 0);
    const totalCaloriesLogged = clients.reduce((acc, c) => acc + c.stats.totalCaloriesLogged, 0);

    res.status(200).json({
      success: true,
      clients,
      stats: {
        totalAssignedClients: totalClients,
        avgCompletionRate: avgAdherence,
        totalMealsCompleted: totalMealsDone,
        totalCaloriesLogged
      },
      recentActivity
    });
  } catch (error: any) {
    console.error('Error fetching trainer diet clients overview:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// 6. Get Single Customer Diet Progress (Trainer Modal)
export const getCustomerDietProgress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const customerId = String(req.params.customerId);
    if (!customerId) {
      res.status(400).json({ success: false, message: 'customerId is required' });
      return;
    }

    const overview = await buildCustomerDietOverview(customerId);
    res.status(200).json({
      success: true,
      ...overview
    });
  } catch (error: any) {
    console.error('Error fetching customer diet progress:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};
