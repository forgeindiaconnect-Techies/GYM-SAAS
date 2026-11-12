import https from 'https';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
  error?: {
    code: number;
    message: string;
    status: string;
  };
}

// AI Generation Service (Rule-Based Expert Engine Fallback)
export const mockAIGeneration = (fitnessProfile: any) => {
  const goal = fitnessProfile.fitnessGoal || 'General Fitness';
  const level = fitnessProfile.currentFitnessLevel || fitnessProfile.experienceLevel || 'Beginner';
  const age = Number(fitnessProfile.age) || 28;
  const weight = Number(fitnessProfile.weight) || 70;
  const height = Number(fitnessProfile.height) || 172;
  const gender = fitnessProfile.gender || 'Not specified';
  const equipment = fitnessProfile.equipmentAvailability || fitnessProfile.workoutPreference || 'Full Gym';
  const dietPref = fitnessProfile.dietaryPreferences || fitnessProfile.dietPreference || 'Non-Vegetarian';
  const injuries = fitnessProfile.injuries || fitnessProfile.healthConsiderations || 'None reported';
  const activityLevel = fitnessProfile.activityLevel || 'Moderately Active';

  // Body Measurements
  const measurements = fitnessProfile.bodyMeasurements || {
    chest: fitnessProfile.chest || '-',
    waist: fitnessProfile.waist || '-',
    hips: fitnessProfile.hips || '-',
    arms: fitnessProfile.arms || '-',
    thighs: fitnessProfile.thighs || '-'
  };

  // BMI Calculation
  const heightM = height / 100;
  const bmiNum = heightM > 0 ? weight / (heightM * heightM) : 22.0;
  const bmi = bmiNum.toFixed(1);
  const bmiCategory = bmiNum < 18.5 ? 'Underweight' : bmiNum < 25 ? 'Normal' : bmiNum < 30 ? 'Overweight' : 'Obese';

  // BMR & Calorie Target Calculation (Mifflin-St Jeor)
  const isFemale = String(gender).toLowerCase() === 'female';
  const bmr = Math.round(10 * weight + 6.25 * height - 5 * age + (isFemale ? -161 : 5));
  const activityMultiplier = 1.45;
  const maintenanceCalories = Math.round(bmr * activityMultiplier);

  const lowerGoal = goal.toLowerCase();
  const isWeightLossGoal = lowerGoal.includes('weight loss') || lowerGoal.includes('fat loss');
  const isMuscleGoal = lowerGoal.includes('muscle') || lowerGoal.includes('hypertrophy') || lowerGoal.includes('weight gain');
  const isStrengthGoal = lowerGoal.includes('strength');
  const isEnduranceGoal = lowerGoal.includes('endurance') || lowerGoal.includes('stamina');

  const baseTargetCalories = isWeightLossGoal
    ? Math.max(1450, maintenanceCalories - 450)
    : isMuscleGoal
    ? maintenanceCalories + 300
    : isStrengthGoal
    ? maintenanceCalories + 150
    : maintenanceCalories;

  const proteinGrams = Math.round(weight * (isMuscleGoal || isStrengthGoal ? 2.0 : 1.7));
  const fatGrams = Math.round((baseTargetCalories * 0.25) / 9);
  const carbGrams = Math.max(100, Math.round((baseTargetCalories - proteinGrams * 4 - fatGrams * 9) / 4));
  const targetWeightDisplay = fitnessProfile.targetWeight || (isWeightLossGoal ? Math.max(45, Math.round(weight * 0.9)) : isMuscleGoal ? Math.round(weight + 4) : weight);

  let goalAnalysis = '';
  let recommendedApproach = '';
  let assessment = '';
  let limitations = '';

  const customerName = fitnessProfile.fullName || 'Member';
  const workoutTime = fitnessProfile.preferredWorkoutTime || 'Morning';

  if (isWeightLossGoal) {
    goalAnalysis = `Personalized for ${customerName} (BMI ${bmi} - ${bmiCategory}, ${weight} kg -> Target ${targetWeightDisplay} kg): targeting sustainable fat reduction at ~${baseTargetCalories} kcal/day (${proteinGrams}g protein, ${carbGrams}g carbs, ${fatGrams}g fats). Focuses on preserving lean muscle mass while accelerating metabolic expenditure during your ${workoutTime} sessions.`;
    recommendedApproach = 'High-density resistance training (compound movements) combined with post-workout Zone 2 cardio (20–25 mins) and daily step accumulation (8,000–10,000 steps/day).';
    assessment = `Baseline tracking for ${customerName}: Weekly morning weigh-ins (starting ${weight} kg), monthly waist/hips/chest measurements, max-rep push-ups & timed plank checks, and RPE monitoring across every session.`;
    limitations = injuries !== 'None reported' && injuries !== 'None' && !String(injuries).startsWith('None (')
      ? `Reported considerations: "${injuries}". Avoid high-impact joint loading on affected areas and prioritize controlled tempo alternatives.`
      : 'Maintain strict pelvic stability and neutral spine under fatigue. Increase cardio incline gradually to protect knees and ankles.';
  } else if (isMuscleGoal) {
    goalAnalysis = `Personalized for ${customerName} (BMI ${bmi} - ${bmiCategory}, ${weight} kg -> Target ${targetWeightDisplay} kg): clean muscle hypertrophy surplus of ~${baseTargetCalories} kcal/day with ${proteinGrams}g daily protein (~${(proteinGrams / weight).toFixed(1)}g/kg) paired with progressive overload during ${workoutTime} workouts.`;
    recommendedApproach = 'Targeted hypertrophy split (8–12 rep range, 2–3 RIR, 2–3 second eccentric control) emphasizing mechanical tension and weekly volume progression.';
    assessment = `Baseline tracking for ${customerName}: Bi-weekly weight checks (starting ${weight} kg), chest/arm/thigh tape measurements every 4 weeks, and logbook tracking of progressive weight/rep increases.`;
    limitations = injuries !== 'None reported' && injuries !== 'None' && !String(injuries).startsWith('None (')
      ? `Medical consideration: "${injuries}". Substitute painful free-weight angles with machine-stabilized paths.`
      : 'Ensure proper scapular retraction and core bracing before compound lifts. Prioritize full range of motion over ego lifting.';
  } else if (isStrengthGoal) {
    goalAnalysis = `Personalized for ${customerName} (BMI ${bmi} - ${bmiCategory}, ${weight} kg): maximal force & neuromuscular strength development fueled by ~${baseTargetCalories} kcal/day (${proteinGrams}g protein) timed around ${workoutTime} training.`;
    recommendedApproach = 'Linear strength progression anchored on Squat, Hinge, Push, and Pull patterns (4–6 heavy reps with 90–120s rest) plus targeted accessory stability.';
    assessment = `Baseline tracking for ${customerName}: Track working-set 5RM/8RM benchmarks on main compound lifts and monitor bar speed and joint recovery weekly.`;
    limitations = 'Use safety pins or a spotter on heavy squats/presses. Schedule a lighter deload every 5th week.';
  } else if (isEnduranceGoal) {
    goalAnalysis = `Personalized for ${customerName} (BMI ${bmi} - ${bmiCategory}, ${weight} kg): aerobic capacity & muscular stamina optimization supported by ~${baseTargetCalories} kcal/day (${carbGrams}g carbs for glycogen replenishment, ${proteinGrams}g protein for recovery).`;
    recommendedApproach = 'Mixed-modal conditioning combining metabolic resistance circuits (12–20 reps, 30–45s rest) with Zone 2 aerobic base and interval bursts.';
    assessment = `Baseline tracking for ${customerName}: Monitor resting heart rate, 1.5 km pace/recovery heart rate drop at 1 minute, and circuit work capacity.`;
    limitations = 'Prioritize electrolyte hydration and ankle/calf warm-up prior to conditioning blocks.';
  } else {
    goalAnalysis = `Personalized for ${customerName} (BMI ${bmi} - ${bmiCategory}, ${weight} kg -> Target ${targetWeightDisplay} kg): holistic strength, mobility, and metabolic health supported by ~${baseTargetCalories} kcal/day (${proteinGrams}g protein, ${carbGrams}g carbs, ${fatGrams}g fats).`;
    recommendedApproach = 'Balanced full-body functional resistance, posture/mobility restoration, and moderate-intensity cardiovascular conditioning.';
    assessment = `Baseline tracking for ${customerName}: Weekly bodyweight check, mobility range checks (deep squat & overhead reach), and stamina progression.`;
    limitations = 'Emphasize dynamic joint mobilization during warm-up and controlled nasal breathing during conditioning.';
  }

  let days = parseInt(fitnessProfile.availableWorkoutDays) || 4;
  if (String(fitnessProfile.availableWorkoutDays).includes('1-2')) days = 2;
  if (String(fitnessProfile.availableWorkoutDays).includes('3-4')) days = 4;
  if (String(fitnessProfile.availableWorkoutDays).includes('5-6')) days = 6;
  if (String(fitnessProfile.availableWorkoutDays).includes('Every day') || String(fitnessProfile.availableWorkoutDays).includes('7')) days = 6;

  const isHomeOrBodyweight = equipment.toLowerCase().includes('home') || equipment.toLowerCase().includes('bodyweight') || equipment.toLowerCase().includes('no equipment');
  const repRange = isStrengthGoal ? '5-6' : isWeightLossGoal || isEnduranceGoal ? '12-15' : '8-12';
  const restTime = isStrengthGoal ? '120s' : isWeightLossGoal ? '45s' : '60s';
  const setCount = String(level).toLowerCase().includes('advanced') ? 4 : 3;

  const makeEx = (name: string, targetMuscleGroup: string, instructions: string, customReps?: string, customDuration = '10 mins') => ({
    name,
    sets: setCount,
    reps: customReps || repRange,
    rest: restTime,
    duration: customDuration,
    difficulty: level,
    targetMuscleGroup,
    instructions
  });

  const dailyWorkouts: Record<string, any> = isHomeOrBodyweight
    ? {
        Monday: {
          day: 'Monday',
          focus: isWeightLossGoal ? 'Lower Body Fat-Burn Circuit' : 'Home Lower Body & Core Strength',
          duration: '45 mins',
          targetMuscle: 'Quadriceps, Glutes & Core',
          exercises: [
            makeEx('Bodyweight Goblet Squats', 'Quadriceps & Glutes', 'Drop hips between heels, keep chest proud and drive up powerfully.'),
            makeEx('Reverse Alternating Lunges', 'Glutes & Hamstrings', 'Step back into a 90-degree lunge, control descent without knee wobble.'),
            makeEx('Glute Bridges (2s Squeeze)', 'Gluteus Maximus', 'Drive through heels and hold top hip extension for 2 seconds.'),
            makeEx('Plank with Shoulder Taps', 'Deep Core & Obliques', 'Brace abs tight and tap opposite shoulder without hip sway.', '45 sec')
          ]
        },
        Tuesday: {
          day: 'Tuesday',
          focus: 'Upper Body Push & Pull (Home)',
          duration: '40 mins',
          targetMuscle: 'Chest, Shoulders, Back & Triceps',
          exercises: [
            makeEx('Tempo Push-ups', 'Chest, Front Delts & Triceps', 'Lower for 3 seconds, pause at bottom, press cleanly overhead.'),
            makeEx('Pike Push-ups', 'Shoulders & Upper Chest', 'Hips raised in inverted V, lower head smoothly toward floor.'),
            makeEx('Resistance Band / Inverted Rows', 'Upper Back & Lats', 'Pull chest to bar or row band tightly, squeezing shoulder blades.'),
            makeEx('Close-Grip Diamond Push-ups', 'Triceps & Inner Chest', 'Keep elbows tucked close to ribs through full range.')
          ]
        },
        Wednesday: {
          day: 'Wednesday',
          focus: 'Active Recovery, Core & Mobility',
          duration: '30 mins',
          targetMuscle: 'Hip Mobility, Spine & Core',
          exercises: [
            makeEx('Deep Squat Mobility Holds', 'Hips & Ankles', 'Hold bottom squat position pushing knees outward gently.', '60 sec hold', '8 mins'),
            makeEx('Dead Bug Core Stabilizers', 'Transverse Abdominis', 'Press lower back flat into floor while extending opposite arm and leg.', '12 / side'),
            makeEx('Bird-Dog Extensions', 'Lower Back & Glutes', 'Extend opposite arm and leg smoothly with 2s pause.', '12 / side'),
            makeEx('Brisk Outdoor / Indoor March', 'Cardiovascular System', 'Maintain steady Zone 2 aerobic pace.', '20 mins', '20 mins')
          ]
        },
        Thursday: {
          day: 'Thursday',
          focus: isWeightLossGoal ? 'Metabolic Conditioning & Posterior Chain' : 'Hamstrings, Glutes & Stamina',
          duration: '45 mins',
          targetMuscle: 'Hamstrings, Glutes & Cardiovascular Engine',
          exercises: [
            makeEx('Single-Leg Romanian Deadlift', 'Hamstrings & Balance', 'Hinge at hips keeping spine neutral until stretch is felt.'),
            makeEx('Bulgarian Split Squats (Chair/Couch)', 'Quadriceps & Glutes', 'Rear foot elevated, drop back knee vertically toward floor.'),
            makeEx('Step-ups on Sturdy Platform', 'Legs & Conditioning', 'Drive cleanly through front heel without pushing off rear toes.'),
            makeEx('Hollow Body Core Hold', 'Deep Abdominals', 'Flatten lower back against floor with legs & shoulders lifted.', '35-45 sec')
          ]
        },
        Friday: {
          day: 'Friday',
          focus: 'Full Body Sculpt & Upper Back',
          duration: '40 mins',
          targetMuscle: 'Shoulders, Back, Arms & Core',
          exercises: [
            makeEx('Superman Back Extensions', 'Erector Spinae & Rear Delts', 'Lift chest and legs gently, squeezing upper back.', '15 reps'),
            makeEx('Band / Dumbbell Lateral Raises', 'Lateral Deltoids', 'Lift arms smoothly to shoulder height without shrugging traps.'),
            makeEx('Incline Push-ups', 'Chest & Shoulders', 'Hands on bench/sofa edge, maintain strict straight body line.'),
            makeEx('Side Plank Hip Dips', 'Obliques & Lateral Hip', 'Lift hips smoothly while keeping shoulders stacked.', '35 sec / side')
          ]
        },
        Saturday: {
          day: 'Saturday',
          focus: isWeightLossGoal ? 'High-Output Cardio & Core Burn' : 'Conditioning & Athletic Endurance',
          duration: '35 mins',
          targetMuscle: 'Full Body Conditioning & Abs',
          exercises: [
            makeEx('Controlled Mountain Climbers', 'Cardio & Core', 'Drive knees steadily toward chest without lifting hips.', '45 sec'),
            makeEx('Jumping Jacks / Step Jacks', 'Aerobic Conditioning', 'Rhythmic steady pace for cardiovascular warmup and burn.', '60 sec'),
            makeEx('Bicycle Crunches (Slow Tempo)', 'Rectus Abdominis & Obliques', 'Rotate ribcage, not just elbows, toward opposite knee.', '20 total'),
            makeEx('Shadow Boxing / Brisk Jog', 'Stamina & Fat Oxidation', 'Steady continuous movement to finish session.', '12 mins', '12 mins')
          ]
        },
        Sunday: {
          day: 'Sunday',
          focus: 'Rest, Hydration & Gentle Recovery',
          duration: '20 mins',
          targetMuscle: 'Full Body Parasympathetic Recovery',
          exercises: [
            makeEx('Cat-Cow Spinal Flow', 'Spine & Posture', 'Breathe slowly through gentle flexion and extension.', '12 slow cycles', '8 mins'),
            makeEx('Seated Hamstring & Hip Stretch', 'Lower Body Flexibility', 'Hold mild comfortable stretch for 45 seconds per side.', '45 sec / side', '8 mins'),
            makeEx('Light Recovery Walk', 'Circulation & Step Target', 'Relaxed walk outdoors to reach daily steps.', '20 mins', '20 mins')
          ]
        }
      }
    : {
        Monday: {
          day: 'Monday',
          focus: isWeightLossGoal ? 'Lower Body Strength + Fat-Loss Finisher' : isStrengthGoal ? 'Heavy Squat & Lower Body Power' : 'Lower Body & Core Fundamentals',
          duration: '50 mins',
          targetMuscle: 'Quadriceps, Glutes, Hamstrings & Core',
          exercises: [
            makeEx('Barbell Squats', 'Quadriceps, Glutes & Hamstrings', 'Chest proud, brace core, descend with controlled depth and drive up cleanly.'),
            makeEx('Leg Press Machine', 'Quadriceps & Glutes', 'Full knee bend without lifting lower back off pad.'),
            makeEx('Dumbbell Walking Lunges', 'Glutes, Quads & Stabilizers', 'Step long, lower back knee smoothly, push cleanly through front heel.'),
            makeEx(isWeightLossGoal ? 'Incline Treadmill Brisk Walk (Zone 2)' : 'Plank with Shoulder Taps', isWeightLossGoal ? 'Cardiovascular Fat Oxidation' : 'Core & Stability', isWeightLossGoal ? 'Set incline 6-8% at 5.2 km/h for steady aerobic burn.' : 'Hold crisp plank without hip wobble.', isWeightLossGoal ? '20 mins' : '45-60 sec', isWeightLossGoal ? '20 mins' : '8 mins')
          ]
        },
        Tuesday: {
          day: 'Tuesday',
          focus: isMuscleGoal ? 'Upper Body Push & Pull Hypertrophy' : 'Upper Body Compound Strength',
          duration: '45 mins',
          targetMuscle: 'Chest, Lats, Shoulders & Arms',
          exercises: [
            makeEx('Flat Dumbbell Bench Press', 'Chest, Front Delts & Triceps', 'Retract shoulder blades, lower dumbbells to chest line and press cleanly.'),
            makeEx('Lat Pulldowns', 'Latissimus Dorsi & Biceps', 'Drive elbows downward toward hips to upper chest without leaning far back.'),
            makeEx('Overhead Dumbbell Shoulder Press', 'Anterior & Lateral Deltoids', 'Press weights smoothly overhead without overarching lower back.'),
            makeEx('Seated Cable Row', 'Rhomboids, Mid Back & Lats', 'Pull handle smoothly toward torso squeezing shoulder blades together.')
          ]
        },
        Wednesday: {
          day: 'Wednesday',
          focus: isWeightLossGoal ? 'Zone 2 Cardio, Mobility & Core Circuit' : 'Active Recovery, Mobility & Core',
          duration: '35 mins',
          targetMuscle: 'Cardiovascular Endurance, Hips & Core',
          exercises: [
            makeEx('Deep Squat Mobility Holds & Hip Openers', 'Hip Flexors & Ankles', 'Spend 60s opening hips and ankle dorsiflexion.', '60 sec hold', '8 mins'),
            makeEx('Hanging Knee Raises', 'Lower Abs & Grip', 'Lift knees under full control with zero swinging.'),
            makeEx('Cable Woodchoppers', 'Obliques & Rotational Core', 'Pivot hips cleanly while keeping arms extended.', '12 / side'),
            makeEx(isEnduranceGoal || isWeightLossGoal ? 'Stationary Cycling / Elliptical Intervals' : 'Zone 2 Low-Intensity Incline Walk', 'Cardio & Recovery', 'Alternate steady moderate pace to boost endurance without soreness.', '20 mins', '20 mins')
          ]
        },
        Thursday: {
          day: 'Thursday',
          focus: 'Posterior Chain, Hamstrings & Glutes',
          duration: '50 mins',
          targetMuscle: 'Hamstrings, Glutes, Lower Back & Calves',
          exercises: [
            makeEx('Romanian Deadlifts (RDL)', 'Hamstrings & Glutes', 'Hinge hips backward with slight knee bend until deep hamstring stretch.'),
            makeEx('Bulgarian Split Squats', 'Quads, Glutes & Balance', 'Rear foot elevated, drop hips vertically keeping torso upright.'),
            makeEx('Lying / Seated Hamstring Curl', 'Hamstrings', 'Lower weight over 3 seconds, squeeze hard at full curl.'),
            makeEx('Standing Calf Raises', 'Gastrocnemius & Soleus', 'Pause 2 seconds in full stretch at bottom and full peak at top.')
          ]
        },
        Friday: {
          day: 'Friday',
          focus: isStrengthGoal ? 'Upper Body Heavy Push & Accessories' : 'Upper Body Hypertrophy & Arms',
          duration: '45 mins',
          targetMuscle: 'Upper Chest, Deltoids, Biceps & Triceps',
          exercises: [
            makeEx('Incline Dumbbell Bench Press', 'Upper Chest & Shoulders', '30-degree incline, smooth eccentric and full lockout.'),
            makeEx('Dumbbell Lateral Raises', 'Lateral Deltoids', 'Lead with elbows to shoulder height, avoid swinging torso.'),
            makeEx('Standing Dumbbell Bicep Curls', 'Biceps Brachii', 'Keep elbows pinned at sides and control the lowering phase.'),
            makeEx('Rope Tricep Pushdowns', 'Triceps Brachii', 'Extend elbows fully and spread rope gently at bottom.')
          ]
        },
        Saturday: {
          day: 'Saturday',
          focus: isWeightLossGoal ? 'Metabolic Circuit & Conditioning' : 'Full-Body Conditioning & Core Finisher',
          duration: '40 mins',
          targetMuscle: 'Back, Core & Aerobic Conditioning',
          exercises: [
            makeEx('Chest-Supported Dumbbell Row', 'Upper Back & Rear Delts', 'Pull dumbbells toward hips squeezing rear shoulders cleanly.'),
            makeEx('Face Pulls (Cable Rope)', 'Rear Delts & Rotator Cuff', 'Pull rope toward forehead keeping elbows high for shoulder health.'),
            makeEx('Farmer Carries (Dumbbells)', 'Grip, Traps & Core Stability', 'Walk tall with packed shoulders and braced core.', '40 meters'),
            makeEx('Rowing Ergometer / Incline Walk', 'Conditioning & Fat Burn', 'Steady challenging aerobic finish.', '15 mins', '15 mins')
          ]
        },
        Sunday: {
          day: 'Sunday',
          focus: 'Rest Day & Neural Recovery',
          duration: '20 mins',
          targetMuscle: 'Full Body Recovery & Flexibility',
          exercises: [
            makeEx('Thoracic Spine & Cat-Cow Mobility', 'Upper Back & Spine', 'Smooth breathing through spinal flexion and extension.', '12 cycles', '8 mins'),
            makeEx('Pigeon & Couch Hip Stretch', 'Hip Flexors & Glutes', 'Relax into stretch for 45 seconds per side.', '45 sec / side', '8 mins'),
            makeEx('Outdoor Recovery Walk', 'Active Step Target', 'Gentle walk to encourage blood flow and recovery.', '20 mins', '20 mins')
          ]
        }
      };

  // Respect days/week preference on recovery days
  if (days <= 3) {
    dailyWorkouts.Tuesday = { ...dailyWorkouts.Tuesday, focus: 'Active Recovery Walk & Stretching', duration: '25 mins', exercises: dailyWorkouts.Sunday.exercises };
    dailyWorkouts.Thursday = { ...dailyWorkouts.Thursday, focus: 'Light Mobility & Core Stability', duration: '25 mins', exercises: dailyWorkouts.Wednesday.exercises };
  }

  const weeklySchedule = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => ({
    day,
    workout: dailyWorkouts[day].focus,
    duration: dailyWorkouts[day].duration
  }));

  const exercises = [
    ...dailyWorkouts.Monday.exercises.slice(0, 3),
    ...dailyWorkouts.Tuesday.exercises.slice(0, 3),
    ...dailyWorkouts.Thursday.exercises.slice(0, 3)
  ];

  // Diet matching non-repeating 7-day Monday to Sunday plan based on dietPref and calorie target
  const lowerDiet = String(dietPref).toLowerCase();
  const isVegan = lowerDiet.includes('vegan');
  const isEggetarian = lowerDiet.includes('egg');
  const isVeg = !isVegan && !isEggetarian && lowerDiet.includes('veg') && !lowerDiet.includes('non');

  const mealCalAdjustments = [0, 40, -20, -50, 60, 90, -60];
  const dayMacros = (offset: number) => {
    const cal = Math.max(1400, Math.round(baseTargetCalories + offset));
    const p = proteinGrams;
    const f = fatGrams;
    const c = Math.max(90, Math.round((cal - p * 4 - f * 9) / 4));
    return {
      calories: cal,
      macros: { protein: `${p}g`, carbs: `${c}g`, fats: `${f}g` }
    };
  };

  const dailyMealPlans = [
    {
      day: 'Monday',
      morning: 'Warm ginger-lemon water + 5 soaked almonds. Pre-workout: 1 banana with 1 tsp peanut butter.',
      breakfast: isVegan ? '150g scrambled spiced tofu with spinach, tomatoes, and 2 slices whole-wheat toast.' : isVeg ? '150g Paneer bhurji with tomatoes, spinach, and 2 slices whole-wheat toast.' : isEggetarian ? '3 scrambled eggs + 1 egg white with spinach, mushrooms, and 2 slices whole-wheat toast.' : '3-4 scrambled whole eggs with spinach, mushrooms, and 2 slices whole-wheat toast.',
      midMorning: isVegan ? '1 small crisp apple + handful of roasted pumpkin seeds.' : '1 small crisp apple + 1 cup low-fat Greek yogurt.',
      lunch: isVegan || isVeg ? '150g grilled tofu/paneer + 1 cup brown rice + mixed cucumber & tomato salad with olive oil.' : '180g grilled chicken breast + 1 cup brown rice + mixed cucumber & tomato salad with olive oil.',
      evening: 'Roasted spiced chana (chickpeas) + roasted pumpkin seeds + green tea.',
      dinner: isVegan || isVeg ? 'Yellow dal tadka + sautéed broccoli & bell peppers + 1 small baked sweet potato.' : isEggetarian ? 'Yellow dal tadka + 2 boiled egg whites + sautéed broccoli & small baked sweet potato.' : 'Steamed fish fillet with lemon & herbs + 1 bowl lentil soup + small baked sweet potato.',
      ...dayMacros(mealCalAdjustments[0])
    },
    {
      day: 'Tuesday',
      morning: 'Warm water with pinch of pink Himalayan salt & chia seeds. Pre-workout: 2 rice cakes with almond butter.',
      breakfast: isVegan ? 'Rolled oats porridge in almond milk topped with fresh blueberries, chia seeds, and plant protein.' : 'Rolled oats porridge in almond milk topped with fresh blueberries, chia seeds, and 1 scoop protein.',
      midMorning: 'Handful (30g) of raw walnuts and golden raisins.',
      lunch: isVegan || isVeg || isEggetarian ? 'Spiced rajma (kidney bean) quinoa bowl with diced avocado, cherry tomatoes, and lime dressing.' : 'Shredded grilled chicken quinoa bowl with diced avocado, bell peppers, and lime vinaigrette.',
      evening: 'Sprouted moong bean salad with diced onions, tomatoes, coriander, and lemon juice.',
      dinner: isVegan ? 'Grilled tempeh / soya chunk skewers + sautéed asparagus + clear vegetable soup.' : isVeg ? 'Grilled soya chunks / cottage cheese skewers + sautéed asparagus + clear vegetable soup.' : isEggetarian ? '2 whole eggs poached in spiced vegetable soup + sautéed asparagus + soya chunks.' : 'Grilled lemon-herb chicken skewers + sautéed asparagus + clear vegetable broth.',
      ...dayMacros(mealCalAdjustments[1])
    },
    {
      day: 'Wednesday',
      morning: 'Warm fenugreek (methi) infused water. Pre-workout: 1 slice whole-grain toast with mashed avocado.',
      breakfast: isVegan ? 'Besan & moong dal chilla stuffed with grated veggies & mint chutney + 1 fresh orange.' : isVeg ? 'Moong dal chilla (savory pancakes) stuffed with crumbled paneer & mint chutney, 1 orange.' : 'Vegetable omelette with diced bell peppers, baby spinach, and 1 whole fresh orange.',
      midMorning: '1 bowl of diced fresh papaya or chilled watermelon cubes.',
      lunch: isVegan || isVeg || isEggetarian ? 'Chickpea (chana) and spinach curry with 1 cup steamed quinoa and fresh beetroot salad.' : 'Pan-seared salmon fillet with 1 cup steamed quinoa and fresh beetroot & rocket salad.',
      evening: isVegan ? 'Soy yogurt cup topped with 1 tsp ground flaxseeds and fresh sliced strawberries.' : 'Greek yogurt cup topped with 1 tsp ground flaxseeds and fresh sliced strawberries.',
      dinner: isVegan ? 'Pan-seared sesame tofu with portobello mushrooms & zucchini in light stir-fry.' : isVeg ? 'Pan-seared cottage cheese (paneer) with mushrooms & zucchini in light sesame oil.' : isEggetarian ? 'Stir-fried egg & veggie bowl with mushrooms, zucchini, and light sesame oil.' : 'Stir-fried chicken breast strips with zucchini, snap peas, and bok choy in light sesame oil.',
      ...dayMacros(mealCalAdjustments[2])
    },
    {
      day: 'Thursday',
      morning: 'Warm water with 1 tbsp raw apple cider vinegar. Pre-workout: 2 Medjool dates + 4 walnut halves.',
      breakfast: isVegan || isVeg ? 'High-protein green smoothie bowl: spinach, banana, protein scoop, topped with hemp and pumpkin seeds.' : 'High-protein smoothie bowl: almond milk, banana, whey/egg protein, topped with pumpkin seeds.',
      midMorning: 'Crisp cucumber & carrot crudités with 2 tbsp roasted red pepper hummus.',
      lunch: isVegan ? 'Spiced vegetable & lentil khichdi with roasted cumin + 1 bowl fresh kachumber salad.' : isVeg || isEggetarian ? 'Spiced vegetable & lentil khichdi with roasted cumin + 1 cup low-fat curd (dahi).' : 'Lemon-rosemary grilled chicken with Mediterranean roasted zucchini, peppers, and baby potatoes.',
      evening: 'Fox nuts (makhana) dry-roasted with rock salt + organic green tea.',
      dinner: isVegan ? 'Grilled spiced tofu steaks with hearty vegetable minestrone soup and sautéed French beans.' : isVeg ? 'Grilled paneer steaks with large bowl of vegetable minestrone soup and sautéed French beans.' : isEggetarian ? 'Vegetable minestrone soup with 3 boiled egg whites and sautéed French beans.' : 'Steamed white fish fillet with hearty vegetable minestrone soup and sautéed French beans.',
      ...dayMacros(mealCalAdjustments[3])
    },
    {
      day: 'Friday',
      morning: 'Freshly brewed green tea + 5 overnight soaked almonds. Pre-workout: 1 small banana with sunflower butter.',
      breakfast: isVegan || isVeg ? 'Smashed avocado and grilled spiced tofu/paneer on toasted sourdough bread with black coffee.' : 'Poached eggs on toasted artisan sourdough bread with sautéed spinach and black coffee.',
      midMorning: '1 whole ripe pear or fresh guava slices with a pinch of rock salt.',
      lunch: isVegan || isVeg || isEggetarian ? 'Black bean, sweet corn, and sautéed fajita bell pepper bowl over wild brown rice with guacamole.' : 'Chicken & bell pepper fajita bowl over wild brown rice with fresh guacamole and pico de gallo.',
      evening: isVegan || isVeg ? 'Roasted chana and raw sunflower seeds mix + iced peppermint tea.' : '3 boiled egg whites seasoned with cracked black pepper + green tea.',
      dinner: isVegan || isVeg ? 'Thai tofu/paneer and broccoli red curry cooked in light coconut milk with cauliflower rice.' : isEggetarian ? 'Thai broccoli curry with soft-boiled eggs in light coconut broth + cauliflower rice.' : 'Pan-seared tilapia or tuna steak with cauliflower rice, sautéed spinach, and side salad.',
      ...dayMacros(mealCalAdjustments[4])
    },
    {
      day: 'Saturday',
      morning: 'Warm water with freshly squeezed lemon juice. Pre-workout: 1 crisp apple with 1 tbsp peanut butter.',
      breakfast: isVegan || isVeg ? 'Protein oat pancakes (oats, banana, flax meal) topped with fresh blueberries.' : 'Protein oat pancakes (oats, banana, egg whites, whey) topped with fresh blueberries.',
      midMorning: 'Fresh tender coconut water with soft coconut kernel.',
      lunch: isVegan || isVeg || isEggetarian ? 'Baked chickpea falafel & garlic hummus whole-wheat wrap with cucumber-tomato salad.' : 'Mediterranean grilled chicken wrap in whole-wheat tortilla with cucumber-tomato tabbouleh.',
      evening: 'Steamed edamame pods tossed with Himalayan sea salt + iced green tea.',
      dinner: isVegan ? 'Oven-roasted tofu & bell pepper skewers with roasted potato wedges and grilled asparagus.' : isVeg ? 'Oven-roasted paneer & bell pepper skewers with roasted potato wedges and grilled asparagus.' : isEggetarian ? 'Herb-baked egg frittata with bell peppers, potato wedges, and grilled asparagus.' : 'Herb-roasted chicken breast with oven-baked potato wedges and grilled asparagus.',
      ...dayMacros(mealCalAdjustments[5])
    },
    {
      day: 'Sunday',
      morning: 'Warm water infused with fresh mint leaves and lemon slices. Active Rest: Chamomile herbal tea.',
      breakfast: isVegan || isVeg ? 'Tofu scramble shakshuka simmered in spiced tomatoes, onions, and bell peppers with multigrain toast.' : 'Traditional shakshuka (eggs poached in spiced tomato-pepper sauce) with 1 slice multigrain toast.',
      midMorning: '1 whole fresh pomegranate or 2 peeled kiwis.',
      lunch: isVegan ? 'Hearty mixed dal tadka with steamed basmati rice + cucumber-mint salad.' : isVeg || isEggetarian ? 'Hearty mixed yellow & black dal tadka with paneer + 1 cup steamed rice + cucumber raita.' : 'Herb-infused roasted chicken breast + 1 cup steamed basmati rice + roasted cumin cucumber raita.',
      evening: 'Antioxidant trail mix (almonds, walnuts, dried cranberries, pumpkin seeds).',
      dinner: isVegan ? 'Hearty vegetable & lentil hot pot stew with steamed broccoli, carrots, and warm turmeric almond milk.' : isVeg || isEggetarian ? 'Hearty vegetable & lentil hot pot stew with broccoli, carrots, and warm turmeric golden milk.' : 'Grilled fish or chicken broth soup with steamed carrots, broccoli, and warm golden milk.',
      ...dayMacros(mealCalAdjustments[6])
    }
  ];

  const morning = dailyMealPlans[0].morning;
  const breakfast = dailyMealPlans[0].breakfast;
  const lunch = dailyMealPlans[0].lunch;
  const evening = dailyMealPlans[0].evening;
  const dinner = dailyMealPlans[0].dinner;
  const hydration = 'Target 3.5-4 liters of water daily, spread throughout the day. Consider adding electrolyte tablets to water during/after intense training.';

  return {
    aiAnalysis: {
      fitnessSummary: `Customer: ${fitnessProfile.fullName || 'Member'} | Age: ${age} | Gender: ${gender} | Height: ${height} cm | Weight: ${weight} kg | BMI: ${bmi} | Goal: ${goal} | Level: ${level} | Equipment: ${equipment} | Chest: ${measurements.chest} | Waist: ${measurements.waist} | Hips: ${measurements.hips} | Arms: ${measurements.arms} | Thighs: ${measurements.thighs}`,
      profileSummary: `Current Weight: ${weight} kg\nTarget Weight: ${fitnessProfile.targetWeight || '-'} kg\nHeight: ${height} cm\nBMI: ${bmi}\nFitness Goal: ${goal}\nExperience Level: ${level}\nActivity Level: ${activityLevel}\nTraining Days: ${days} days/week\nEquipment: ${equipment}`,
      goalAnalysis,
      recommendedApproach,
      assessment,
      limitations,
      generalRecommendations: 'Prioritize water intake (minimum 3.5-4L/day), sleep hygiene (7-9 hrs), progressive resistance tracking, and post-workout protein timing within 90 minutes.'
    },
    workoutRecommendation: {
      weeklySchedule,
      exercises,
      dailyWorkouts
    },
    dietRecommendation: {
      dailyMealPlans,
      morning,
      breakfast,
      lunch,
      evening,
      dinner,
      hydration,
      note: 'Draft AI nutritional suggestion based on customer profile. Requires assigned Trainer review & approval before adoption.'
    },
    recoveryRecommendations: {
      sleep: 'Aim for 7-9 hours of consistent, high-quality sleep per night for optimal nervous system recovery and myofibrillar repair.',
      activeRecovery: 'On designated active recovery days (Tuesday, Thursday, or Sunday), perform 20-30 mins of low-intensity Zone 2 walking, mobility flow, or light swimming.',
      stretchingMobility: 'Dynamic stretching (arm circles, leg swings, torso twists) 8-10 mins pre-workout; static stretching (hamstrings, hip flexors, lats) 8-10 mins post-workout.',
      notes: 'If experiencing acute muscular soreness (DOMS), incorporate contrast water showers and light foam rolling.'
    },
    routine: {
      morning: 'Hydration with pink Himalayan salt, dynamic joint rotations, wholesome breakfast within 60 mins of waking.',
      workoutTime: '5-min dynamic warm-up, core workout blocks (45-55 mins), 5-min cool down and stretching.',
      evening: 'Nutritious snack, light mobility / steps check, hydration.',
      night: `Clean dinner at least 2 hours before bed, digital detox 30 mins before sleep (7-9 hours target).`
    },
    progressSuggestions: {
      focusAreas: 'Mastering compound movement biomechanics, tracking weekly progressive overload, and maintaining strict macronutrient consistency.',
      improvementSuggestions: 'Gradually increase weight by 2.5kg or reps by 1-2 every 7–10 days while maintaining strict biomechanical form.',
      progressTracking: 'Baseline strength tests (push-ups, bodyweight squats, 60s plank, 1-mile walk/run); weekly Monday morning weigh-ins; monthly chest/waist/hip/arms measurements.',
      startingWeight: String(weight)
    }
  };
};


/**
 * Low-level call to Google Gemini REST API
 */
export const callGemini = async (
  prompt: string, 
  systemInstruction?: string,
  options?: {
    model?: string;
    jsonMode?: boolean;
    maxOutputTokens?: number;
    temperature?: number;
  }
): Promise<string> => {
  const apiKey = (process.env.GEMINI_API_KEY || GEMINI_API_KEY).trim();
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const model = options?.model || 'gemini-2.5-flash';
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const generationConfig: any = {
    temperature: options?.temperature ?? 0.7,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: options?.maxOutputTokens ?? 6000
  };

  if (options?.jsonMode) {
    generationConfig.responseMimeType = 'application/json';
  }

  const payloadData: any = {
    contents: [
      {
        role: 'user',
        parts: [{ text: prompt }]
      }
    ],
    generationConfig
  };

  if (systemInstruction) {
    payloadData.systemInstruction = {
      parts: [{ text: systemInstruction }]
    };
  }

  const payload = JSON.stringify(payloadData);

  return new Promise((resolve, reject) => {
    const req = https.request(
      endpoint,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload)
        },
        timeout: 45000 // 45s timeout for full 7-day plan generation
      },
      (res) => {
        let raw = '';
        res.on('data', (chunk) => (raw += chunk));
        res.on('end', () => {
          try {
            const data: GeminiResponse = JSON.parse(raw);
            if (res.statusCode && res.statusCode >= 400) {
              const errMsg = data.error?.message || `Gemini API returned status ${res.statusCode}`;
              return reject(new Error(errMsg));
            }
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!text) {
              return reject(new Error('No response text returned by Gemini'));
            }
            resolve(text);
          } catch (e: any) {
            reject(new Error(`Failed to parse Gemini response: ${e.message}`));
          }
        });
      }
    );

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Gemini API request timed out'));
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.write(payload);
    req.end();
  });
};

/**
 * Generate comprehensive AI Fitness & Diet Plan using Gemini
 * Falls back safely to mockAIGeneration if Gemini fails
 */
export const generateGeminiFitnessPlan = async (fitnessProfile: any) => {
  const fallback = mockAIGeneration(fitnessProfile);

  try {
    const prompt = `You are a World-Class Certified Strength & Conditioning Specialist (CSCS) and Clinical Sports Dietitian.
Generate a comprehensive, scientifically tailored fitness assessment, progressive workout routine, and clinical nutrition plan for the following customer:

CUSTOMER BIOMETRICS & PROFILE:
- Full Name: ${fitnessProfile.fullName || 'Member'}
- Gender: ${fitnessProfile.gender || 'Not specified'}
- Age: ${fitnessProfile.age || 28} years
- Height: ${fitnessProfile.height || 172} cm
- Weight: ${fitnessProfile.weight || 70} kg
- Primary Fitness Goal: ${fitnessProfile.fitnessGoal || 'General Fitness'}
- Experience Level: ${fitnessProfile.currentFitnessLevel || fitnessProfile.experienceLevel || 'Beginner'}
- Training Days: ${fitnessProfile.availableWorkoutDays || 4} days per week
- Preferred Time: ${fitnessProfile.preferredWorkoutTime || 'Morning'}
- Equipment: ${fitnessProfile.equipmentAvailability || 'Full Gym'}
- Training Mode: ${fitnessProfile.preferredTraining || 'Gym Workout'}
- Diet Preference: ${fitnessProfile.dietaryPreferences || 'Non-Vegetarian'}
- Medical/Injuries: ${fitnessProfile.injuries || 'None'}
- Target Weight: ${fitnessProfile.targetWeight || 'Optimal'}

Provide your response as a valid JSON object matching this schema:
{
  "aiAnalysis": {
    "fitnessSummary": "Short 1-line summary including age, height, weight, BMI, goal, and experience level",
    "profileSummary": "Formatted summary of user biometrics and training parameters",
    "goalAnalysis": "Detailed 2-3 sentence physiological explanation of the pathway to achieve their target",
    "recommendedApproach": "Strategic training methodology and periodization focus",
    "assessment": "Baseline assessment should include: Bodyweight (weekly), Body Measurements (waist, hips, chest, arms – monthly), basic strength tests (e.g., max reps push-ups, planks for time, bodyweight squats), and a 1-mile walk/run test to establish cardiovascular fitness. Monitor perceived exertion (RPE) for all exercises to guide progression.",
    "limitations": "Safety precautions and exercise contraindications for their health/injuries",
    "generalRecommendations": "Daily hydration, recovery, and lifestyle recommendations"
  },
  "workoutRecommendation": {
    "weeklySchedule": [
      { "day": "Monday", "workout": "Lower Body & Core Fundamentals", "duration": "50 min" },
      { "day": "Tuesday", "workout": "Upper Body Push & Pull", "duration": "45 min" },
      { "day": "Wednesday", "workout": "Active Recovery & Mobility Flow", "duration": "30 min" },
      { "day": "Thursday", "workout": "Legs, Posterior Chain & Glutes", "duration": "50 min" },
      { "day": "Friday", "workout": "Upper Body Hypertrophy & Arms", "duration": "45 min" },
      { "day": "Saturday", "workout": "Conditioning & Core Endurance", "duration": "35 min" },
      { "day": "Sunday", "workout": "Full Body Rest & Neural Regeneration", "duration": "-" }
    ],
    "exercises": [
      {
        "name": "Barbell Squats",
        "sets": 3,
        "reps": "8-12",
        "duration": "12 min",
        "rest": "90s",
        "difficulty": "${fitnessProfile.currentFitnessLevel || 'Beginner'}",
        "targetMuscleGroup": "Quadriceps, Glutes, Hamstrings"
      }
    ]
  },
  "dietRecommendation": {
    "dailyMealPlans": [
      {
        "day": "Monday",
        "morning": "Morning pre-workout and hydration",
        "breakfast": "Post-workout breakfast meal",
        "midMorning": "Mid-morning wholesome snack",
        "lunch": "Balanced nutrient-dense lunch",
        "evening": "Late afternoon snack / tea",
        "dinner": "Light recovery dinner",
        "calories": 2150,
        "macros": { "protein": "150g", "carbs": "210g", "fats": "58g" }
      }
    ],
    "morning": "Morning Hydration & Pre-workout suggestion",
    "breakfast": "Nutritious breakfast suggestion",
    "lunch": "Lean protein with complex carbs and veggies",
    "evening": "Afternoon snack and hydration",
    "dinner": "Clean dinner with lean protein and veggies",
    "hydration": "Target 3.5-4 liters of water daily, spread throughout the day. Consider adding electrolyte tablets to water during/after workouts",
    "note": "Key macronutrient breakdown and daily caloric target"
  },
  "recoveryRecommendations": {
    "sleep": "Aim for 7-9 hours of consistent, high-quality sleep per night for optimal nervous system recovery and myofibrillar repair",
    "activeRecovery": "On designated active recovery days (e.g., Tuesday, Thursday, Sunday), perform 20-30 mins of low-intensity Zone 2 walking, mobility flow, or light swimming",
    "stretchingMobility": "Dynamic stretching (arm circles, leg swings, torso twists) 8-10 mins pre-workout; static stretching (hamstrings, hip flexors, lats) 8-10 mins post-workout",
    "notes": "Injury prevention guidelines and joint longevity protocol"
  },
  "routine": {
    "morning": "Hydration with pink Himalayan salt, dynamic joint rotations, wholesome breakfast within 60 mins of waking",
    "workoutTime": "${fitnessProfile.preferredWorkoutTime || 'Morning'}",
    "evening": "Nutritious snack, light mobility / steps check, hydration",
    "night": "Clean dinner at least 2 hours before bed, digital detox 30 mins before sleep (7-9 hours target)"
  },
  "progressSuggestions": {
    "focusAreas": "Mastering compound movement biomechanics, tracking weekly progressive overload, and maintaining strict macronutrient consistency",
    "improvementSuggestions": "Gradually increase load by 2.5kg or reps by 1-2 every 7–10 days while maintaining strict biomechanical form",
    "progressTracking": "Baseline strength tests (push-ups, bodyweight squats, 60s plank, 1-mile walk/run); weekly Monday morning weigh-ins; monthly chest/waist/hip/arms measurements",
    "startingWeight": "${fitnessProfile.weight || 70}"
  }
}

CRITICAL RULES FOR DIET GENERATION:
1. In 'dietRecommendation.dailyMealPlans', generate all 7 DAYS from Monday to Sunday ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday').
2. EVERY SINGLE DAY MUST HAVE COMPLETELY DIFFERENT, UNIQUE MEALS for morning, breakfast, midMorning, lunch, evening, and dinner. 
3. MEALS MUST NOT BE REPEATED THROUGHOUT THE WEEK. Provide genuine daily culinary variety tailored to their diet preference (${fitnessProfile.dietaryPreferences || 'Non-Vegetarian'}).
4. Generate exactly 9 calibrated exercises in 'exercises' matching their equipment (${fitnessProfile.equipmentAvailability || 'Full Gym'}) and goal (${fitnessProfile.fitnessGoal || 'General Fitness'}).`;


    const rawResponse = await callGemini(
      prompt, 
      'You are a certified sports science trainer and clinical dietitian. Return only JSON.',
      { jsonMode: true, maxOutputTokens: 6000 }
    );
    
    let cleaned = rawResponse.trim();
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    const parsed = JSON.parse(cleaned);

    if (parsed.aiAnalysis && parsed.workoutRecommendation?.exercises?.length && parsed.dietRecommendation) {
      const mergedDailyMealPlans = (Array.isArray(parsed.dietRecommendation.dailyMealPlans) && parsed.dietRecommendation.dailyMealPlans.length >= 7)
        ? parsed.dietRecommendation.dailyMealPlans
        : fallback.dietRecommendation.dailyMealPlans;

      return {
        aiAnalysis: { ...fallback.aiAnalysis, ...parsed.aiAnalysis },
        workoutRecommendation: {
          weeklySchedule: parsed.workoutRecommendation.weeklySchedule || fallback.workoutRecommendation.weeklySchedule,
          exercises: parsed.workoutRecommendation.exercises || fallback.workoutRecommendation.exercises,
          dailyWorkouts: parsed.workoutRecommendation.dailyWorkouts || fallback.workoutRecommendation.dailyWorkouts
        },
        dietRecommendation: { 
          ...fallback.dietRecommendation, 
          ...parsed.dietRecommendation,
          dailyMealPlans: mergedDailyMealPlans
        },
        recoveryRecommendations: { ...fallback.recoveryRecommendations, ...parsed.recoveryRecommendations },
        routine: { ...fallback.routine, ...parsed.routine },
        progressSuggestions: { ...fallback.progressSuggestions, ...parsed.progressSuggestions }
      };
    }
  } catch (err: any) {
    console.warn('[Gemini AI] Plan generation fallback invoked:', err.message);
  }

  return fallback;
};

