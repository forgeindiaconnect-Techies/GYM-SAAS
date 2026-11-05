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

export const REPLACEMENT_OPTIONS = [
  { name: 'Goblet Squats', muscle: 'Quads & Glutes' },
  { name: 'Leg Press (Machine)', muscle: 'Quadriceps' },
  { name: 'Dumbbell Bench Press', muscle: 'Pectorals & Triceps' },
  { name: 'Incline Dumbbell Press', muscle: 'Upper Chest' },
  { name: 'Seated Cable Row', muscle: 'Back & Lats' },
  { name: 'Lat Pulldowns', muscle: 'Lats & Biceps' },
  { name: 'Romanian Deadlifts', muscle: 'Hamstrings & Glutes' },
  { name: 'Dumbbell Lateral Raises', muscle: 'Lateral Deltoids' },
  { name: 'Cable Tricep Pushdown', muscle: 'Triceps' },
  { name: 'Incline Dumbbell Curls', muscle: 'Biceps' }
];

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
        instructions: 'Feet shoulder-width apart. Keep chest upright, brace core, and descend until thighs are parallel to ground.'
      },
      {
        name: 'Flat Dumbbell Bench Press',
        sets: 3,
        reps: '10 - 12',
        rest: '60s',
        duration: '10 mins',
        difficulty: 'Beginner',
        targetMuscleGroup: 'Chest, Front Deltoids, Triceps',
        instructions: 'Lie flat on the bench. Lower dumbbells with control to chest level, press up smoothly.'
      },
      {
        name: 'Push-ups / Close-Grip Pushups',
        sets: 3,
        reps: '12 - 15',
        rest: '60s',
        duration: '8 mins',
        difficulty: 'Beginner',
        targetMuscleGroup: 'Chest, Triceps, Shoulders',
        instructions: 'Maintain a straight plank line from head to heels. Elbows tucked at 45 degrees.'
      },
      {
        name: 'Plank with Shoulder Taps',
        sets: 3,
        reps: '45 - 60 sec hold',
        rest: '45s',
        duration: '6 mins',
        difficulty: 'Beginner',
        targetMuscleGroup: 'Transverse Abdominis, Obliques',
        instructions: 'Hold high plank with feet slightly wide. Tap opposite shoulder without rocking hips.'
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
        instructions: 'Slight lean back. Pull bar down to upper chest, driving elbows downward and back.'
      },
      {
        name: 'Seated Cable Row',
        sets: 3,
        reps: '10 - 12',
        rest: '60s',
        duration: '10 mins',
        difficulty: 'Beginner',
        targetMuscleGroup: 'Rhomboids, Middle Traps, Lats',
        instructions: 'Pull handle into upper abdomen, keeping shoulders depressed.'
      },
      {
        name: 'Dumbbell Overhead Shoulder Press',
        sets: 3,
        reps: '10 - 12',
        rest: '60s',
        duration: '8 mins',
        difficulty: 'Beginner',
        targetMuscleGroup: 'Anterior & Medial Deltoids',
        instructions: 'Press dumbbells straight upward, lock out briefly, then lower with control.'
      }
    ]
  },
  Wednesday: {
    day: 'Wednesday',
    focus: 'Aerobic Recovery & Core Stability',
    duration: '35 mins',
    targetMuscle: 'Cardiovascular System, Spinal Mobility & Deep Core',
    exercises: [
      {
        name: 'Incline Treadmill Power Walk',
        sets: 1,
        reps: '20 mins continuous',
        rest: '0s',
        duration: '20 mins',
        difficulty: 'All Levels',
        targetMuscleGroup: 'Aerobic Base, Calves & Posterior Chain',
        instructions: 'Maintain 5.0 - 5.5 km/h at 8-10% incline. Pump arms naturally with tall posture.'
      },
      {
        name: 'Cat-Cow Mobility Flow',
        sets: 3,
        reps: '12 cycles',
        rest: '30s',
        duration: '6 mins',
        difficulty: 'Beginner',
        targetMuscleGroup: 'Erector Spinae, Thoracic Spine',
        instructions: 'Move gently on hands and knees between full spinal flexion and extension.'
      },
      {
        name: 'Dead Bug Core Stabilizers',
        sets: 3,
        reps: '10 reps / side',
        rest: '45s',
        duration: '8 mins',
        difficulty: 'Beginner',
        targetMuscleGroup: 'Deep Core, Pelvic Floor',
        instructions: 'Lower opposite arm and leg while pressing lower back flat into the mat.'
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
        instructions: 'Hinge back at hips with soft knees until deep hamstring stretch. Squeeze glutes to stand.'
      },
      {
        name: 'Bulgarian Split Squats',
        sets: 3,
        reps: '10 / leg',
        rest: '60s',
        duration: '10 mins',
        difficulty: 'Intermediate',
        targetMuscleGroup: 'Quadriceps, Glutes, Stabilizers',
        instructions: 'Rear foot elevated on a bench. Lower hips vertically until front thigh is parallel.'
      },
      {
        name: 'Lying Hamstring Leg Curl',
        sets: 3,
        reps: '12 - 15',
        rest: '45s',
        duration: '8 mins',
        difficulty: 'Beginner',
        targetMuscleGroup: 'Biceps Femoris, Hamstrings',
        instructions: 'Control descent for 3 seconds. Pull heels towards glutes and squeeze at peak.'
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
        targetMuscleGroup: 'Upper Chest, Triceps',
        instructions: 'Bench at 30-degree incline. Press dumbbells upward with elbows at 45 degrees.'
      },
      {
        name: 'Dumbbell Lateral Raises',
        sets: 4,
        reps: '12 - 15',
        rest: '45s',
        duration: '8 mins',
        difficulty: 'Beginner',
        targetMuscleGroup: 'Lateral Deltoids',
        instructions: 'Raise dumbbells to side up to shoulder height with slight forward lean.'
      },
      {
        name: 'Cable Tricep Rope Pushdowns',
        sets: 3,
        reps: '12 - 15',
        rest: '45s',
        duration: '8 mins',
        difficulty: 'Beginner',
        targetMuscleGroup: 'Triceps Lateral & Medial Heads',
        instructions: 'Pin elbows to ribs, extend arms straight down and flare rope outwards at bottom.'
      }
    ]
  },
  Saturday: {
    day: 'Saturday',
    focus: 'High Intensity Conditioning & Core Burn',
    duration: '40 mins',
    targetMuscle: 'Full Body Endurance, Abdominals & Obliques',
    exercises: [
      {
        name: 'Kettlebell Swings',
        sets: 4,
        reps: '15 - 20',
        rest: '60s',
        duration: '10 mins',
        difficulty: 'Intermediate',
        targetMuscleGroup: 'Glutes, Hamstrings, Core, Shoulders',
        instructions: 'Explosive hip hinge driving kettlebell up to chest height.'
      },
      {
        name: 'Mountain Climbers & Plank Hold',
        sets: 3,
        reps: '45 sec continuous',
        rest: '30s',
        duration: '6 mins',
        difficulty: 'Beginner',
        targetMuscleGroup: 'Core, Shoulder Stabilizers',
        instructions: 'High plank position. Drive knees alternately towards chest at steady pace.'
      },
      {
        name: 'Russian Twists',
        sets: 3,
        reps: '20 reps',
        rest: '45s',
        duration: '6 mins',
        difficulty: 'Beginner',
        targetMuscleGroup: 'Obliques, Rotational Core',
        instructions: 'Sit with knees bent, lean back 45 degrees. Rotate torso touching ground each side.'
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
        instructions: 'Slowly roll over tight muscle groups, pausing 20-30s on trigger points.'
      },
      {
        name: 'Dynamic Yoga Flow & Child\'s Pose',
        sets: 1,
        reps: '15 mins flow',
        rest: '0s',
        duration: '15 mins',
        difficulty: 'All Levels',
        targetMuscleGroup: 'Full Body Flexibility',
        instructions: 'Flow through downward dog, cobra, and deep child pose with slow nasal breathing.'
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
    morning: 'Warm lemon & ginger water (500ml) + 5 soaked almonds. Pre-workout: 1 small banana.',
    breakfast: '3 scrambled whole eggs with spinach & mushrooms, 2 slices whole-wheat toast, black coffee.',
    midMorning: '1 crisp apple + 1 cup low-fat Greek yogurt with dash of cinnamon.',
    lunch: '180g grilled chicken breast + 1 cup brown rice + steamed broccoli with extra virgin olive oil.',
    evening: '1 scoop Whey Protein Isolate shaken with cold water + handful of roasted chana.',
    dinner: '160g baked salmon fillet (or dal tadka with paneer) + baked sweet potato + mixed salad.'
  },
  Tuesday: {
    day: 'Tuesday',
    focus: 'Strength Fuel & High-Fiber Endurance',
    calories: 2200,
    macros: { protein: '155g', carbs: '215g', fats: '60g' },
    morning: 'Warm water with pink salt & chia seeds. Pre-workout: 2 rice cakes with almond butter.',
    breakfast: 'Rolled oats porridge in almond milk topped with fresh blueberries & protein scoop.',
    midMorning: 'Handful of raw walnuts (30g) and golden raisins + green tea.',
    lunch: 'Shredded chicken quinoa bowl (or rajma bean bowl) with avocado, cherry tomatoes & lime.',
    evening: 'Sprouted moong bean salad with diced cucumbers, tomatoes & lemon chaat masala.',
    dinner: 'Grilled lemon-herb chicken skewers + sautéed asparagus & baby spinach + vegetable broth.'
  },
  Wednesday: {
    day: 'Wednesday',
    focus: 'Cellular Repair & Anti-Inflammatory Nutrition',
    calories: 2180,
    macros: { protein: '160g', carbs: '200g', fats: '62g' },
    morning: 'Warm fenugreek water (500ml) + 1 slice whole-grain toast with mashed avocado.',
    breakfast: 'Vegetable egg-white omelette (4 whites, 1 yolk) with diced peppers + 1 sweet orange.',
    midMorning: '1 bowl fresh cubed papaya or chilled watermelon + mint infused water.',
    lunch: 'Pan-seared salmon fillet (180g) or chana masala + 1 cup steamed quinoa + beetroot salad.',
    evening: 'Low-fat Greek yogurt cup with 1 tsp ground flaxseeds & sliced strawberries.',
    dinner: 'Stir-fried chicken breast strips (or grilled paneer) with zucchini & bok choy in sesame oil.'
  },
  Thursday: {
    day: 'Thursday',
    focus: 'Lean Carb Cycling & Sustained Energy',
    calories: 2120,
    macros: { protein: '152g', carbs: '205g', fats: '59g' },
    morning: 'Warm water with 1 tbsp apple cider vinegar + 2 Medjool dates + 4 walnut halves.',
    breakfast: 'High-protein smoothie bowl: almond milk, banana, spinach & whey protein isolate.',
    midMorning: 'Crisp cucumber & carrot crudités with 3 tbsp roasted red pepper hummus dip.',
    lunch: 'Lemon-rosemary grilled chicken thigh (200g) or spiced vegetable khichdi + roasted zucchini.',
    evening: 'Roasted fox nuts (makhana) lightly seasoned with pink salt + green tea.',
    dinner: 'Steamed white fish fillet (or grilled paneer steaks) + vegetable minestrone soup.'
  },
  Friday: {
    day: 'Friday',
    focus: 'Peak Performance & Glycogen Replenishment',
    calories: 2240,
    macros: { protein: '158g', carbs: '220g', fats: '64g' },
    morning: 'Organic green tea + 5 soaked almonds & 1 small banana.',
    breakfast: 'Poached eggs (3 eggs) or smashed spiced tofu on artisan sourdough with grilled tomatoes.',
    midMorning: '1 whole ripe juicy pear or fresh guava slices with chaat masala.',
    lunch: 'Chicken & bell pepper fajita bowl (or black bean bowl) with brown rice & pico de gallo.',
    evening: '3 boiled egg whites sprinkled with black pepper + iced peppermint tea.',
    dinner: 'Pan-seared tuna or tilapia steak (or Thai tofu curry) + cauliflower rice.'
  },
  Saturday: {
    day: 'Saturday',
    focus: 'Weekend Vitality & Clean Refuel',
    calories: 2280,
    macros: { protein: '162g', carbs: '230g', fats: '63g' },
    morning: 'Warm water with half squeezed fresh lime & raw honey + 4 soaked almonds.',
    breakfast: 'Protein pancake stack (oats, banana, egg whites, protein) with pure maple syrup.',
    midMorning: '1 fresh orange or cup of mixed berries + raw pumpkin seeds.',
    lunch: 'Mediterranean grilled turkey patties (or soy patties) in pita with tzatziki & romaine.',
    evening: 'Antioxidant green smoothie: baby spinach, green apple, cucumber & coconut water.',
    dinner: 'Grilled lemon-garlic shrimp (or grilled tofu) with roasted sweet potato wedges.'
  },
  Sunday: {
    day: 'Sunday',
    focus: 'Gut Reset & Active Recovery Nutrition',
    calories: 2100,
    macros: { protein: '148g', carbs: '200g', fats: '58g' },
    morning: 'Warm water infused with mint leaves and lemon slices + chamomile herbal infusion.',
    breakfast: 'Traditional Shakshuka (3 poached eggs in tomato pepper cumin sauce) + 1 multigrain toast.',
    midMorning: '1 whole fresh ruby pomegranate or 2 golden kiwis + mint water.',
    lunch: 'Herb-infused roasted chicken breast (or Dal Tadka with paneer) + steamed rice & raita.',
    evening: 'Antioxidant trail mix (almonds, walnuts, cranberries) + herbal detox tea.',
    dinner: 'Grilled white fish fillet (or red lentil hot pot stew) + steamed broccoli in savory broth.'
  }
};

