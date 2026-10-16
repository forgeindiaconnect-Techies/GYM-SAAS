export interface ExerciseItem {
  name: string;
  sets: number;
  reps: string;
  rest: string;
  duration?: string;
  difficulty?: string;
  targetMuscleGroup?: string;
  instructions?: string;
  videoUrl?: string;
}

export interface DayWorkout {
  day: string;
  focus: string;
  duration: string;
  targetMuscle: string;
  exercises: ExerciseItem[];
}

export interface DayDiet {
  day: string;
  focus: string;
  calories: number;
  macros: { protein: string; carbs: string; fats: string };
  morning: string;
  breakfast: string;
  midMorning: string;
  lunch: string;
  evening: string;
  dinner: string;
}

export const DEFAULT_WEEKLY_WORKOUTS: Record<string, DayWorkout> = {
  Monday: {
    day: 'Monday',
    focus: 'Lower Body & Core Fundamentals',
    duration: '50 mins',
    targetMuscle: 'Quadriceps, Glutes, Hamstrings & Core',
    exercises: [
      {
        name: 'Barbell Squats',
        sets: 4,
        reps: '8 - 12',
        rest: '90s',
        duration: '12 mins',
        difficulty: 'Beginner / Intermediate',
        targetMuscleGroup: 'Quadriceps, Glutes, Hamstrings',
        instructions: 'Feet shoulder-width apart. Keep chest upright, brace core, and descend until thighs are parallel to the ground.'
      },
      {
        name: 'Flat Dumbbell Bench Press',
        sets: 3,
        reps: '10 - 12',
        rest: '60s',
        duration: '10 mins',
        difficulty: 'Beginner',
        targetMuscleGroup: 'Chest, Front Deltoids, Triceps',
        instructions: 'Lie flat on the bench with feet planted. Lower dumbbells with control to chest level, press up without clanking dumbbells.'
      },
      {
        name: 'Push-ups / Close-Grip Pushups',
        sets: 3,
        reps: '12 - 15',
        rest: '60s',
        duration: '8 mins',
        difficulty: 'Beginner',
        targetMuscleGroup: 'Chest, Triceps, Shoulders',
        instructions: 'Maintain a straight plank line from head to heels. Elbows tucked at 45 degrees, lower smoothly and press up.'
      },
      {
        name: 'Plank with Shoulder Taps',
        sets: 3,
        reps: '45 - 60 sec hold',
        rest: '45s',
        duration: '6 mins',
        difficulty: 'Beginner',
        targetMuscleGroup: 'Transverse Abdominis, Obliques',
        instructions: 'Hold high plank with feet slightly wide for stability. Tap opposite shoulder without rocking your hips.'
      }
    ]
  },
  Tuesday: {
    day: 'Tuesday',
    focus: 'Upper Body Push & Pull Strength',
    duration: '45 mins',
    targetMuscle: 'Upper Back, Lats, Biceps & Shoulders',
    exercises: [
      {
        name: 'Lat Pulldowns',
        sets: 4,
        reps: '10 - 12',
        rest: '60s',
        duration: '10 mins',
        difficulty: 'Beginner',
        targetMuscleGroup: 'Latissimus Dorsi, Biceps',
        instructions: 'Slight lean back in torso. Pull the bar down to upper chest level, driving elbows downward and back.'
      },
      {
        name: 'Seated Cable Row',
        sets: 3,
        reps: '10 - 12',
        rest: '60s',
        duration: '10 mins',
        difficulty: 'Beginner',
        targetMuscleGroup: 'Rhomboids, Middle Traps, Lats',
        instructions: 'Keep back flat with neutral spine. Pull handle toward belly button, squeezing shoulder blades together.'
      },
      {
        name: 'Standing Dumbbell Bicep Curls',
        sets: 3,
        reps: '12 - 15',
        rest: '45s',
        duration: '8 mins',
        difficulty: 'Beginner',
        targetMuscleGroup: 'Biceps Brachii',
        instructions: 'Pin elbows to your ribs. Curl weights smoothly upward with supination at the top, lower with a 2-second negative.'
      },
      {
        name: 'Overhead Dumbbell Shoulder Press',
        sets: 3,
        reps: '10 - 12',
        rest: '60s',
        duration: '10 mins',
        difficulty: 'Beginner / Intermediate',
        targetMuscleGroup: 'Anterior & Lateral Deltoids',
        instructions: 'Sit tall with lower back supported. Press dumbbells upward in a slight arc overhead until arms are extended.'
      }
    ]
  },
  Wednesday: {
    day: 'Wednesday',
    focus: 'Active Recovery & Functional Mobility',
    duration: '30 mins',
    targetMuscle: 'Joint Mobility, Core Stabilizers & Aerobic Conditioning',
    exercises: [
      {
        name: 'Deep Squat Mobility Holds & Hip Openers',
        sets: 3,
        reps: '60 sec hold',
        rest: '30s',
        duration: '6 mins',
        difficulty: 'Beginner',
        targetMuscleGroup: 'Hip Flexors, Adductors, Ankles',
        instructions: 'Sink into deepest comfortable squat stance, keeping heels flat on the floor and chest raised tall.'
      },
      {
        name: 'Cat-Cow Spinal Decompression Flow',
        sets: 3,
        reps: '12 cycles',
        rest: '30s',
        duration: '6 mins',
        difficulty: 'Beginner',
        targetMuscleGroup: 'Erector Spinae, Thoracic Spine, Cervical Mobility',
        instructions: 'Move gently on hands and knees between full spinal flexion and extension, synchronizing breath.'
      },
      {
        name: 'Dead Bug Core Stabilizers',
        sets: 3,
        reps: '10 reps / side',
        rest: '45s',
        duration: '8 mins',
        difficulty: 'Beginner',
        targetMuscleGroup: 'Deep Core, Pelvic Floor, Anterior Stabilizers',
        instructions: 'Lower opposite arm and leg while pressing lower back flat into the ground without arching.'
      },
      {
        name: 'Bird-Dog Glute & Lower Back Extensions',
        sets: 3,
        reps: '10 reps / side',
        rest: '30s',
        duration: '6 mins',
        difficulty: 'Beginner',
        targetMuscleGroup: 'Gluteus Medius, Lower Traps, Core',
        instructions: 'Reach arm forward and opposite leg back in a straight horizontal line. Pause 2 seconds at peak.'
      }
    ]
  },
  Thursday: {
    day: 'Thursday',
    focus: 'Posterior Chain & Hamstring Hypertrophy',
    duration: '50 mins',
    targetMuscle: 'Hamstrings, Glute Max, Lower Back & Calves',
    exercises: [
      {
        name: 'Romanian Deadlifts (RDL)',
        sets: 4,
        reps: '10 - 12',
        rest: '90s',
        duration: '12 mins',
        difficulty: 'Intermediate',
        targetMuscleGroup: 'Hamstrings, Glutes, Erector Spinae',
        instructions: 'Hinge back at the hips with soft knees until you feel a deep hamstring stretch. Squeeze glutes to return upright.'
      },
      {
        name: 'Bulgarian Split Squats',
        sets: 3,
        reps: '10 / leg',
        rest: '60s',
        duration: '10 mins',
        difficulty: 'Intermediate',
        targetMuscleGroup: 'Quadriceps, Glutes, Stabilizers',
        instructions: 'Rear foot elevated on a bench. Lower hips vertically until front thigh is parallel to ground.'
      },
      {
        name: 'Lying or Seated Hamstring Leg Curl',
        sets: 3,
        reps: '12 - 15',
        rest: '45s',
        duration: '8 mins',
        difficulty: 'Beginner',
        targetMuscleGroup: 'Biceps Femoris, Semitendinosus',
        instructions: 'Control the descent for 3 seconds. Pull heels in towards glutes and squeeze at the peak contraction.'
      },
      {
        name: 'Standing Calf Raises',
        sets: 4,
        reps: '15 - 20',
        rest: '45s',
        duration: '8 mins',
        difficulty: 'Beginner',
        targetMuscleGroup: 'Gastrocnemius, Soleus',
        instructions: 'Full stretch at bottom of platform, rise up onto balls of feet, hold 1 second at peak.'
      }
    ]
  },
  Friday: {
    day: 'Friday',
    focus: 'Hypertrophy & Arm Sculpting',
    duration: '45 mins',
    targetMuscle: 'Deltoids, Biceps, Triceps & Upper Chest',
    exercises: [
      {
        name: 'Incline Dumbbell Chest Press',
        sets: 4,
        reps: '10 - 12',
        rest: '60s',
        duration: '10 mins',
        difficulty: 'Beginner / Intermediate',
        targetMuscleGroup: 'Clavicular Head (Upper Chest), Triceps',
        instructions: 'Bench at 30-degree incline. Press dumbbells upward with elbows at a 45-degree angle to torso.'
      },
      {
        name: 'Dumbbell Lateral Raises',
        sets: 4,
        reps: '12 - 15',
        rest: '45s',
        duration: '8 mins',
        difficulty: 'Beginner',
        targetMuscleGroup: 'Lateral Deltoids (Shoulder Width)',
        instructions: 'Raise dumbbells to sides with slight elbow bend until parallel with floor. Lead with elbows.'
      },
      {
        name: 'Cable Tricep Pushdown',
        sets: 3,
        reps: '12 - 15',
        rest: '45s',
        duration: '8 mins',
        difficulty: 'Beginner',
        targetMuscleGroup: 'Triceps Lateral & Medial Head',
        instructions: 'Lock elbows at ribs. Push cable bar or rope down until arms are fully extended, squeeze triceps.'
      },
      {
        name: 'Incline Dumbbell Hammer Curls',
        sets: 3,
        reps: '12 reps',
        rest: '45s',
        duration: '8 mins',
        difficulty: 'Beginner',
        targetMuscleGroup: 'Brachialis, Biceps, Forearms',
        instructions: 'Palms facing each other throughout the movement. Curl weights with full range of motion.'
      }
    ]
  },
  Saturday: {
    day: 'Saturday',
    focus: 'Conditioning, HIIT & Core Burn',
    duration: '35 mins',
    targetMuscle: 'Cardiovascular, Total Body & Core Endurance',
    exercises: [
      {
        name: 'Kettlebell Swings / Deadlifts',
        sets: 4,
        reps: '20 reps',
        rest: '60s',
        duration: '10 mins',
        difficulty: 'Beginner / Intermediate',
        targetMuscleGroup: 'Posterior Chain, Glutes, Hips',
        instructions: 'Snap hips forward explosively. The swing power comes from glutes and hips, not arms.'
      },
      {
        name: 'Bodyweight Jump Squats',
        sets: 3,
        reps: '15 reps',
        rest: '45s',
        duration: '8 mins',
        difficulty: 'Intermediate',
        targetMuscleGroup: 'Quadriceps, Calves, Power Output',
        instructions: 'Squat down smoothly, explode upward into a jump, and land softly absorbing impact through knees.'
      },
      {
        name: 'Mountain Climbers & Plank Hold',
        sets: 3,
        reps: '45 sec continuous',
        rest: '30s',
        duration: '6 mins',
        difficulty: 'Beginner',
        targetMuscleGroup: 'Core, Shoulder Stabilizers',
        instructions: 'High plank position. Drive knees alternately towards chest at a rapid, controlled tempo.'
      },
      {
        name: 'Russian Twists',
        sets: 3,
        reps: '20 reps',
        rest: '45s',
        duration: '6 mins',
        difficulty: 'Beginner',
        targetMuscleGroup: 'Internal & External Obliques',
        instructions: 'Sit with knees bent, lean back 45 degrees. Rotate torso from left to right tapping the floor.'
      }
    ]
  },
  Sunday: {
    day: 'Sunday',
    focus: 'Full Body Rest & Neural Regeneration',
    duration: '25 mins',
    targetMuscle: 'Myofascial Tissue, Flexibility & Recovery',
    exercises: [
      {
        name: 'Foam Roller Full Body Release',
        sets: 1,
        reps: '10 mins flow',
        rest: '0s',
        duration: '10 mins',
        difficulty: 'All Levels',
        targetMuscleGroup: 'IT Bands, Quads, Lats, Calves',
        instructions: 'Slowly roll over tender muscle knots, pausing on trigger points for 20-30 seconds.'
      },
      {
        name: 'Dynamic Yoga Flow & Child\'s Pose',
        sets: 1,
        reps: '15 mins flow',
        rest: '0s',
        duration: '15 mins',
        difficulty: 'All Levels',
        targetMuscleGroup: 'Full Body Flexibility',
        instructions: 'Flow through downward dog, cobra, and deep child\'s pose with slow nasal diaphragmatic breathing.'
      },
      {
        name: 'Light Outdoor Nature Walk',
        sets: 1,
        reps: '20 mins walk',
        rest: '0s',
        duration: '20 mins',
        difficulty: 'All Levels',
        targetMuscleGroup: 'Aerobic System & Mental Reset',
        instructions: 'Unhurried outdoor stroll to encourage blood circulation and reduce systemic inflammation.'
      }
    ]
  }
};

export const DEFAULT_WEEKLY_DIET: Record<string, DayDiet> = {
  Monday: {
    day: 'Monday',
    focus: 'Lean Muscle & Metabolic Activation',
    calories: 2150,
    macros: { protein: '155g', carbs: '210g', fats: '58g' },
    morning: 'Warm lemon & ginger water (500ml) + 5 soaked almonds. Pre-workout: 1 small banana with peanut butter.',
    breakfast: '3 scrambled whole eggs with spinach & mushrooms, 2 slices whole-wheat artisan bread, black coffee.',
    midMorning: '1 crisp apple + 1 cup low-fat Greek yogurt with dash of cinnamon.',
    lunch: '180g grilled chicken breast + 1 cup brown rice + steamed broccoli & carrots with extra virgin olive oil.',
    evening: '1 scoop Whey Protein Isolate shaken with cold water + handful of roasted chana.',
    dinner: '160g baked salmon fillet (or yellow dal tadka with paneer) + small baked sweet potato + mixed garden salad.'
  },
  Tuesday: {
    day: 'Tuesday',
    focus: 'Strength Fuel & High-Fiber Endurance',
    calories: 2200,
    macros: { protein: '155g', carbs: '215g', fats: '60g' },
    morning: 'Warm water with Himalayan pink salt & chia seeds. Pre-workout: 2 rice cakes with almond butter.',
    breakfast: 'Rolled oats porridge in unsweetened almond milk topped with fresh blueberries, pumpkin seeds & protein scoop.',
    midMorning: 'Handful of raw walnuts (30g) and golden raisins + green tea.',
    lunch: 'Shredded chicken quinoa bowl (or rajma kidney bean bowl) with avocado, cherry tomatoes & lime vinaigrette.',
    evening: 'Sprouted moong bean salad with diced cucumbers, tomatoes & lemon chaat masala.',
    dinner: 'Grilled lemon-herb chicken skewers + sautéed asparagus & baby spinach + clear vegetable broth soup.'
  },
  Wednesday: {
    day: 'Wednesday',
    focus: 'Cellular Repair & Anti-Inflammatory Nutrition',
    calories: 2180,
    macros: { protein: '160g', carbs: '200g', fats: '62g' },
    morning: 'Warm fenugreek (methi) water (500ml) + 1 slice whole-grain toast with mashed avocado.',
    breakfast: 'Vegetable egg-white omelette (4 whites, 1 yolk) with diced peppers & mushrooms + 1 sweet orange.',
    midMorning: '1 bowl fresh cubed papaya or chilled watermelon + mint infused water.',
    lunch: 'Pan-seared salmon fillet (180g) or chana masala + 1 cup steamed quinoa + beetroot & rocket salad.',
    evening: 'Low-fat Greek yogurt cup with 1 tsp ground flaxseeds & sliced strawberries.',
    dinner: 'Stir-fried chicken breast strips (or grilled paneer) with zucchini, snow peas & bok choy in sesame oil.'
  },
  Thursday: {
    day: 'Thursday',
    focus: 'Lean Carb Cycling & Sustained Energy',
    calories: 2120,
    macros: { protein: '152g', carbs: '205g', fats: '59g' },
    morning: 'Warm water with 1 tbsp raw apple cider vinegar + 2 Medjool dates + 4 walnut halves.',
    breakfast: 'High-protein smoothie bowl: unsweetened almond milk, ripe banana, spinach & whey protein isolate.',
    midMorning: 'Crisp cucumber & carrot crudités with 3 tbsp roasted red pepper hummus dip.',
    lunch: 'Lemon-rosemary grilled chicken thigh (200g) or spiced vegetable khichdi + roasted zucchini & low-fat curd.',
    evening: 'Roasted fox nuts (makhana) lightly seasoned with pink salt + antioxidant green tea.',
    dinner: 'Steamed white cod fillet (or grilled paneer steaks) + hearty vegetable minestrone soup + French beans.'
  },
  Friday: {
    day: 'Friday',
    focus: 'Peak Performance & Glycogen Replenishment',
    calories: 2240,
    macros: { protein: '158g', carbs: '220g', fats: '64g' },
    morning: 'Freshly brewed organic green tea + 5 soaked almonds & 1 small banana.',
    breakfast: 'Poached eggs (3 eggs) or smashed spiced tofu on toasted artisan sourdough with grilled cherry tomatoes.',
    midMorning: '1 whole ripe juicy pear or fresh guava slices with chaat masala + electrolyte water.',
    lunch: 'Chicken & bell pepper fajita bowl (or black bean & sweet corn fajita bowl) with 1 cup wild brown rice & pico de gallo.',
    evening: '3 boiled egg whites sprinkled with black pepper (or roasted chana & sunflower seed mix) + iced peppermint tea.',
    dinner: 'Pan-seared tuna or tilapia steak (or Thai tofu & broccoli red curry) + cauliflower rice tossed with fresh herbs.'
  },
  Saturday: {
    day: 'Saturday',
    focus: 'Weekend Vitality & Clean Refuel',
    calories: 2280,
    macros: { protein: '162g', carbs: '230g', fats: '63g' },
    morning: 'Warm water with half squeezed fresh lime & 1 tsp organic raw honey + 4 soaked almonds.',
    breakfast: 'Protein pancake stack (oats, banana, egg whites, scoop whey protein) drizzled with pure Canadian maple syrup.',
    midMorning: '1 fresh orange or cup of fresh mixed berries + small handful of raw pumpkin seeds.',
    lunch: 'Mediterranean grilled turkey patties (or soy & edamame patties) wrapped in whole wheat pita with tzatziki & romaine.',
    evening: 'Antioxidant green smoothie: fresh baby spinach, green apple, cucumber & unsweetened coconut water.',
    dinner: 'Grilled lemon-garlic jumbo shrimp (or grilled herbed tofu steaks) with roasted sweet potato wedges & baby carrots.'
  },
  Sunday: {
    day: 'Sunday',
    focus: 'Gut Reset & Active Recovery Nutrition',
    calories: 2100,
    macros: { protein: '148g', carbs: '200g', fats: '58g' },
    morning: 'Warm water infused with fresh mint leaves and lemon slices + chamomile herbal infusion.',
    breakfast: 'Traditional Shakshuka (3 poached eggs in rich tomato, bell pepper & cumin sauce) + 1 slice multigrain toast.',
    midMorning: '1 whole fresh ruby pomegranate or 2 peeled golden kiwis + refreshing mint & cucumber water.',
    lunch: 'Herb-infused roasted chicken breast (or mixed Dal Tadka with paneer cubes) + 1 cup steamed basmati rice & cucumber raita.',
    evening: 'Antioxidant trail mix (almonds, walnuts, dried cranberries, pumpkin seeds) + warm herbal detox tea.',
    dinner: 'Grilled white fish fillet (or vegetable & red lentil hot pot stew) + steamed broccoli & carrots in clear savory broth.'
  }
};

/**
 * Returns the unified 7-day workout routine derived from AI output or defaults
 */
export const getUnifiedWeeklyWorkouts = (aiRec?: any): Record<string, DayWorkout> => {
  if (!aiRec) return DEFAULT_WEEKLY_WORKOUTS;

  // If AI generated custom exercises, we can overlay or return
  const result: Record<string, DayWorkout> = JSON.parse(JSON.stringify(DEFAULT_WEEKLY_WORKOUTS));

  if (aiRec.workoutRecommendation?.weeklySchedule && Array.isArray(aiRec.workoutRecommendation.weeklySchedule)) {
    aiRec.workoutRecommendation.weeklySchedule.forEach((item: any) => {
      const day = item.day || item.dayName;
      if (day && result[day]) {
        if (item.workout) result[day].focus = item.workout;
        if (item.duration) result[day].duration = item.duration;
      }
    });
  }

  // If specific exercises exist in aiRec.workoutPlan or originalAiDraft
  const exercises = aiRec.finalApprovedPlan?.workoutPlan || aiRec.workoutPlan || aiRec.originalAiDraft?.workoutPlan;
  if (Array.isArray(exercises) && exercises.length > 0) {
    // Put primary exercises in Monday / Tuesday / etc. if available
    const mondayExercises = exercises.slice(0, 4);
    if (mondayExercises.length > 0) {
      result.Monday.exercises = mondayExercises.map((e: any) => ({
        name: e.name || e.exerciseName || 'Exercise',
        sets: Number(e.sets) || 3,
        reps: String(e.reps || e.repetitions || '10-12'),
        rest: String(e.rest || e.restTime || '60s'),
        duration: e.duration ? String(e.duration) : '10 mins',
        difficulty: e.difficulty || 'Intermediate',
        targetMuscleGroup: e.targetMuscleGroup || e.targetMuscle || 'General',
        instructions: e.instructions || e.trainerNotes || 'Perform exercise with strict form and full range of motion.'
      }));
    }
  }

  return result;
};

/**
 * Returns the unified 7-day diet routine derived from AI output or defaults
 */
export const getUnifiedWeeklyDiet = (aiRec?: any): Record<string, DayDiet> => {
  if (!aiRec) return DEFAULT_WEEKLY_DIET;

  const result: Record<string, DayDiet> = JSON.parse(JSON.stringify(DEFAULT_WEEKLY_DIET));

  const dietRec = aiRec.finalApprovedPlan?.dietPlan || aiRec.dietRecommendation;
  if (!dietRec) return result;

  if (Array.isArray(dietRec.dailyMealPlans) && dietRec.dailyMealPlans.length > 0) {
    dietRec.dailyMealPlans.forEach((plan: any) => {
      const day = plan.day || plan.dayName;
      if (day && result[day]) {
        if (plan.focus) result[day].focus = plan.focus;
        if (plan.calories) result[day].calories = Number(plan.calories);
        if (plan.macros) result[day].macros = plan.macros;
        if (plan.morning) result[day].morning = plan.morning;
        if (plan.breakfast) result[day].breakfast = plan.breakfast;
        if (plan.midMorning) result[day].midMorning = plan.midMorning;
        if (plan.lunch) result[day].lunch = plan.lunch;
        if (plan.evening) result[day].evening = plan.evening;
        if (plan.dinner) result[day].dinner = plan.dinner;
      }
    });
  } else {
    // If single recommendation given across the week
    if (dietRec.morning) {
      Object.keys(result).forEach(day => {
        if (dietRec.morning && day === 'Monday') result[day].morning = dietRec.morning;
        if (dietRec.breakfast && day === 'Monday') result[day].breakfast = dietRec.breakfast;
        if (dietRec.lunch && day === 'Monday') result[day].lunch = dietRec.lunch;
        if (dietRec.dinner && day === 'Monday') result[day].dinner = dietRec.dinner;
      });
    }
  }

  return result;
};
