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
  const bmi = heightM > 0 ? (weight / (heightM * heightM)).toFixed(1) : '22.0';

  let goalAnalysis = '';
  let recommendedApproach = '';
  let assessment = '';
  let limitations = '';

  const lowerGoal = goal.toLowerCase();

  if (lowerGoal.includes('weight loss') || lowerGoal.includes('fat loss')) {
    goalAnalysis = `Targeting sustainable fat reduction with a controlled caloric deficit (~350–500 kcal/day). Given the current BMI of ${bmi} and ${activityLevel.toLowerCase()} baseline, the objective is preserving lean muscle tissue while optimizing metabolic expenditure.`;
    recommendedApproach = 'High-density resistance training (compound movements) combined with post-workout Zone 2 cardio (20–25 mins) and steady step accumulation (8,000–10,000 steps/day).';
    assessment = `Baseline assessment should include: Bodyweight (weekly), Body Measurements (waist, hips, chest, arms – monthly), basic strength tests (e.g., max reps push-ups, planks for time, bodyweight squats), and a 1-mile walk/run test to establish cardiovascular fitness. Monitor perceived exertion (RPE) for all exercises to guide progression.`;
    limitations = injuries !== 'None reported' 
      ? `Reported considerations: "${injuries}". Strictly avoid ballistic impact on affected joints; substitute high-impact movements with low-impact alternatives.`
      : 'Maintain strict pelvic stability and avoid spinal flexion under fatigue. High-volume plyometrics should be phased gradually.';
  } else if (lowerGoal.includes('muscle') || lowerGoal.includes('hypertrophy') || lowerGoal.includes('weight gain')) {
    goalAnalysis = `Prioritizing mechanical tension, metabolic stress, and myofibrillar hypertrophy. Requires a slight hypercaloric surplus (+250–350 kcal/day) with high bioavailability protein (1.8g–2.2g per kg bodyweight).`;
    recommendedApproach = 'Targeted resistance split with 8–12 repetition ranges, 2–3 RIR (reps in reserve), and structured eccentric control (2–3 second tempo).';
    assessment = `Baseline assessment should include: Bodyweight (weekly), Body Measurements (waist, hips, chest, arms – monthly), basic strength tests (e.g., max reps push-ups, planks for time, bodyweight squats), and a 1-mile walk/run test to establish cardiovascular fitness. Monitor perceived exertion (RPE) for all exercises to guide progression.`;
    limitations = injuries !== 'None reported'
      ? `Medical consideration: "${injuries}". Eliminate excessive overhead or deep compression loads where indicated. Prioritize machine guidance for stability.`
      : 'Ensure adequate scapular retraction and core bracing prior to heavy compounds. Prioritize full range of motion over absolute load.';
  } else if (lowerGoal.includes('strength')) {
    goalAnalysis = `Neuromuscular adaptation and force production focus. Low-repetition compound lifts (3–6 reps) at 75–85% 1RM with extended recovery periods.`;
    recommendedApproach = 'Linear progression model focusing on Squat, Hinge, Push, and Pull movement patterns with 90–120s inter-set recovery.';
    assessment = `Baseline assessment should include: Bodyweight (weekly), Body Measurements (waist, hips, chest, arms – monthly), basic strength tests (e.g., max reps push-ups, planks for time, bodyweight squats), and a 1-mile walk/run test to establish cardiovascular fitness. Monitor perceived exertion (RPE) for all exercises to guide progression.`;
    limitations = 'Ensure mandatory spotters for maximal pressing and squatting. Deload week advised every 5th training week.';
  } else {
    goalAnalysis = `Holistic physical conditioning improving cardiovascular endurance, functional mobility, metabolic efficiency, and lean muscle tone.`;
    recommendedApproach = 'Full-body functional resistance circuit interspersed with mobility drills and active recovery periods.';
    assessment = `Baseline assessment should include: Bodyweight (weekly), Body Measurements (waist, hips, chest, arms – monthly), basic strength tests (e.g., max reps push-ups, planks for time, bodyweight squats), and a 1-mile walk/run test to establish cardiovascular fitness. Monitor perceived exertion (RPE) for all exercises to guide progression.`;
    limitations = 'Emphasize dynamic joint mobilization during warm-up. Keep heart rate within 65-75% max HR during conditioning blocks.';
  }

  let days = parseInt(fitnessProfile.availableWorkoutDays) || 4;
  if (String(fitnessProfile.availableWorkoutDays).includes('1-2')) days = 2;
  if (String(fitnessProfile.availableWorkoutDays).includes('3-4')) days = 4;
  if (String(fitnessProfile.availableWorkoutDays).includes('5-6')) days = 6;
  if (String(fitnessProfile.availableWorkoutDays).includes('Every day') || String(fitnessProfile.availableWorkoutDays).includes('7')) days = 6;

  const scheduleTemplate = [
    { day: 'Monday', workout: 'Lower Body & Core Fundamentals', duration: '50 min' },
    { day: 'Tuesday', workout: 'Upper Body Push & Pull', duration: '45 min' },
    { day: 'Wednesday', workout: 'Active Recovery & Mobility Flow', duration: '30 min' },
    { day: 'Thursday', workout: 'Legs, Posterior Chain & Glutes', duration: '50 min' },
    { day: 'Friday', workout: 'Upper Body Hypertrophy & Arms', duration: '45 min' },
    { day: 'Saturday', workout: 'Conditioning & Core Endurance', duration: '35 min' },
    { day: 'Sunday', workout: 'Full Body Rest & Neural Regeneration', duration: '-' },
  ];

  const weeklySchedule = scheduleTemplate.map((item, index) => {
    if (days <= 3 && (index === 1 || index === 3 || index === 5)) {
      return { ...item, workout: 'Rest & Walking', duration: '30 min' };
    }
    if (days === 4 && (index === 2 || index === 5)) {
      return { ...item, workout: 'Rest / Light Mobility', duration: '20 min' };
    }
    return item;
  });

  // 9 Diverse Exercises matching Image 2
  const defaultExercises = [
    { name: 'Barbell Squats', sets: 3, reps: '8-12', duration: '12 min', rest: '90s', difficulty: level, targetMuscleGroup: 'Quadriceps, Glutes, Hamstrings' },
    { name: 'Dumbbell Bench Press', sets: 3, reps: '10-15', duration: '10 min', rest: '60-75s', difficulty: level, targetMuscleGroup: 'Chest, Shoulders, Triceps' },
    { name: 'Lat Pulldowns', sets: 3, reps: '10-15', duration: '10 min', rest: '60-75s', difficulty: level, targetMuscleGroup: 'Lats, Biceps' },
    { name: 'Overhead Dumbbell Press (Seated)', sets: 3, reps: '10-15', duration: '10 min', rest: '60s', difficulty: level, targetMuscleGroup: 'Shoulders, Triceps' },
    { name: 'Dumbbell Romanian Deadlifts', sets: 3, reps: '10-12', duration: '10 min', rest: '60-75s', difficulty: level, targetMuscleGroup: 'Hamstrings, Glutes, Lower Back' },
    { name: 'Seated Cable Row', sets: 3, reps: '10-12', duration: '10 min', rest: '60s', difficulty: level, targetMuscleGroup: 'Upper Back, Lats' },
    { name: 'Dumbbell Walking Lunges', sets: 3, reps: '10-12/leg', duration: '8 min', rest: '60s', difficulty: level, targetMuscleGroup: 'Quadriceps, Glutes' },
    { name: 'Plank with Shoulder Taps', sets: 3, reps: '45-60 sec', duration: '6 min', rest: '45s', difficulty: level, targetMuscleGroup: 'Core, Abdominals' },
    { name: 'Glute Bridges / Bicep Curls', sets: 3, reps: '12-15', duration: '6 min', rest: '45s', difficulty: level, targetMuscleGroup: 'Glutes & Stabilizers' }
  ];

  const isHomeOrBodyweight = equipment.toLowerCase().includes('home') || equipment.toLowerCase().includes('bodyweight') || equipment.toLowerCase().includes('no equipment');
  const exercises = isHomeOrBodyweight ? [
    { name: 'Bodyweight Goblet Squats', sets: 3, reps: '12-15', duration: '10 min', rest: '45s', difficulty: level, targetMuscleGroup: 'Quadriceps, Glutes' },
    { name: 'Tempo Push-ups', sets: 3, reps: '10-12', duration: '8 min', rest: '60s', difficulty: level, targetMuscleGroup: 'Chest, Shoulders, Triceps' },
    { name: 'Reverse Lunges', sets: 3, reps: '12-14/leg', duration: '8 min', rest: '45s', difficulty: level, targetMuscleGroup: 'Hamstrings, Glutes' },
    { name: 'Glute Bridges (Hold 2s)', sets: 3, reps: '15', duration: '6 min', rest: '45s', difficulty: level, targetMuscleGroup: 'Glutes & Core' },
    { name: 'Pike Push-ups / Shoulder Taps', sets: 3, reps: '10-12', duration: '6 min', rest: '45s', difficulty: level, targetMuscleGroup: 'Shoulders, Triceps' },
    { name: 'Inverted Rows (Under Table/Bar)', sets: 3, reps: '10-12', duration: '8 min', rest: '60s', difficulty: level, targetMuscleGroup: 'Back, Lats, Biceps' },
    { name: 'Single-Leg Romanian Deadlift', sets: 3, reps: '10/leg', duration: '8 min', rest: '45s', difficulty: level, targetMuscleGroup: 'Hamstrings, Glutes' },
    { name: 'Plank with Shoulder Taps', sets: 3, reps: '45-60 sec', duration: '5 min', rest: '45s', difficulty: level, targetMuscleGroup: 'Core, Abdominals' },
    { name: 'Hollow Body Hold', sets: 3, reps: '30-45 sec', duration: '5 min', rest: '45s', difficulty: level, targetMuscleGroup: 'Deep Abdominals' }
  ] : defaultExercises;

  // Diet matching non-repeating 7-day Monday to Sunday plan
  const isVeg = dietPref.toLowerCase().includes('veg') && !dietPref.toLowerCase().includes('non');
  
  const dailyMealPlans = [
    {
      day: 'Monday',
      morning: 'Warm ginger-lemon water + 5 soaked almonds. Pre-workout: 1 banana with peanut butter.',
      breakfast: isVeg ? '150g Paneer bhurji with tomatoes, spinach, and 2 slices whole-wheat toast.' : '3-4 scrambled whole eggs with spinach, mushrooms, and 2 slices whole-wheat toast.',
      midMorning: '1 small crisp apple + 1 cup low-fat Greek yogurt.',
      lunch: isVeg ? '150g grilled tofu steak + 1 cup brown rice + mixed cucumber & tomato garden salad with olive oil.' : '180g grilled chicken breast + 1 cup brown rice + mixed cucumber & tomato garden salad with olive oil.',
      evening: 'Roasted spiced chana (chickpeas) + roasted pumpkin seeds + green tea.',
      dinner: isVeg ? 'Yellow dal tadka + sautéed broccoli & bell peppers + 1 small baked sweet potato.' : 'Steamed fish fillet with lemon & herbs + 1 bowl lentil soup + small baked sweet potato.',
      calories: 2150,
      macros: { protein: '150g', carbs: '210g', fats: '58g' }
    },
    {
      day: 'Tuesday',
      morning: 'Warm water with pinch of pink Himalayan salt & chia seeds. Pre-workout: 2 rice cakes with almond butter.',
      breakfast: isVeg ? 'Rolled oats porridge in almond milk topped with fresh blueberries, chia seeds, and plant protein scoop.' : 'Rolled oats porridge in almond milk topped with fresh blueberries, chia seeds, and 1 scoop whey protein.',
      midMorning: 'Handful (30g) of raw walnuts and golden raisins.',
      lunch: isVeg ? 'Spiced rajma (kidney bean) quinoa bowl with diced avocado, cherry tomatoes, and lime vinaigrette.' : 'Turkey or shredded chicken quinoa bowl with diced avocado, bell peppers, and lime vinaigrette.',
      evening: 'Sprouted moong bean salad with diced onions, tomatoes, coriander, and chaat masala.',
      dinner: isVeg ? 'Grilled soya chunks / cottage cheese skewers + sautéed asparagus + clear vegetable soup.' : 'Grilled lemon herb chicken skewers + sautéed asparagus + clear vegetable broth.',
      calories: 2200,
      macros: { protein: '155g', carbs: '215g', fats: '60g' }
    },
    {
      day: 'Wednesday',
      morning: 'Warm fenugreek (methi) infused water. Pre-workout: 1 slice whole-grain toast with mashed avocado.',
      breakfast: isVeg ? 'Moong dal chilla (savory pancakes) stuffed with crumbled paneer & mint chutney, 1 orange.' : 'Vegetable egg white omelette with diced bell peppers, baby spinach, and 1 whole fresh orange.',
      midMorning: '1 bowl of diced fresh papaya or chilled watermelon cubes.',
      lunch: isVeg ? 'Chickpea (chana) and spinach curry with 1 cup steamed quinoa and fresh beetroot salad.' : 'Pan-seared salmon fillet with 1 cup steamed quinoa and fresh beetroot & rocket salad.',
      evening: 'Greek yogurt cup topped with 1 tsp ground flaxseeds and fresh sliced strawberries.',
      dinner: isVeg ? 'Pan-seared cottage cheese (paneer) with portobello mushrooms & zucchini in light sesame oil.' : 'Stir-fried chicken breast strips with zucchini, snap peas, and bok choy in light sesame oil.',
      calories: 2180,
      macros: { protein: '160g', carbs: '200g', fats: '62g' }
    },
    {
      day: 'Thursday',
      morning: 'Warm water with 1 tbsp raw apple cider vinegar. Pre-workout: 2 Medjool dates + 4 walnut halves.',
      breakfast: isVeg ? 'High-protein green smoothie bowl: spinach, banana, plant protein, topped with hemp and pumpkin seeds.' : 'High-protein smoothie bowl: unsweetened almond milk, banana, whey isolate, topped with pumpkin seeds.',
      midMorning: 'Crisp cucumber & carrot crudités with 2 tbsp roasted red pepper hummus.',
      lunch: isVeg ? 'Spiced vegetable & lentil khichdi with roasted cumin seeds + 1 cup low-fat curd (dahi).' : 'Lemon-rosemary grilled chicken thigh with Mediterranean roasted zucchini, bell peppers, and baby potatoes.',
      evening: 'Fox nuts (makhana) lightly roasted in half-tsp ghee with rock salt + organic green tea.',
      dinner: isVeg ? 'Grilled paneer steaks with large bowl of vegetable minestrone soup and sautéed French beans.' : 'Steamed cod or white fish fillet with hearty vegetable minestrone soup and sautéed French beans.',
      calories: 2120,
      macros: { protein: '152g', carbs: '205g', fats: '59g' }
    },
    {
      day: 'Friday',
      morning: 'Freshly brewed green tea + 5 overnight soaked almonds. Pre-workout: 1 small banana with sunflower butter.',
      breakfast: isVeg ? 'Smashed avocado and grilled spiced tofu on toasted artisan sourdough bread with black coffee.' : 'Poached eggs on toasted artisan sourdough bread with sautéed spinach and black coffee.',
      midMorning: '1 whole ripe pear or fresh guava slices with a pinch of rock salt.',
      lunch: isVeg ? 'Black bean, sweet corn, and sautéed fajita bell pepper bowl over wild brown rice with guacamole.' : 'Chicken & bell pepper fajita bowl over wild brown rice with fresh guacamole and pico de gallo.',
      evening: isVeg ? 'Roasted chana and raw sunflower seeds mix + iced peppermint tea.' : '3 boiled egg whites seasoned with cracked black pepper + green tea.',
      dinner: isVeg ? 'Thai tofu and broccoli red curry cooked in light coconut milk with cauliflower rice.' : 'Pan-seared tilapia or tuna steak with cauliflower rice, sautéed baby spinach, and side garden salad.',
      calories: 2240,
      macros: { protein: '158g', carbs: '220g', fats: '64g' }
    },
    {
      day: 'Saturday',
      morning: 'Warm water with freshly squeezed lemon juice. Pre-workout: 1 crisp apple with 1 tbsp peanut butter.',
      breakfast: isVeg ? 'Protein oat pancakes (oats, banana, flax meal) topped with fresh blueberries and 1 tsp pure maple syrup.' : 'Protein oat pancakes (oats, banana, egg whites, whey) topped with fresh blueberries and 1 tsp maple syrup.',
      midMorning: 'Fresh tender coconut water with soft coconut kernel.',
      lunch: isVeg ? 'Crispy falafel & roasted garlic hummus whole-wheat wrap with diced cucumber-tomato tabbouleh.' : 'Mediterranean grilled chicken wrap in whole-wheat tortilla with cucumber-tomato tabbouleh.',
      evening: 'Steamed edamame pods tossed with Himalayan sea salt + iced black/green tea.',
      dinner: isVeg ? 'Oven-roasted paneer & bell pepper skewers with roasted potato wedges and grilled asparagus.' : 'Herb-roasted chicken breast with oven-baked potato wedges and grilled asparagus.',
      calories: 2280,
      macros: { protein: '162g', carbs: '230g', fats: '63g' }
    },
    {
      day: 'Sunday',
      morning: 'Warm water infused with fresh mint leaves and lemon slices. Pre-workout / Active Rest: Chamomile herbal tea.',
      breakfast: isVeg ? 'Tofu scramble shakshuka simmered in spiced tomatoes, onions, and bell peppers with multigrain toast.' : 'Traditional shakshuka (eggs poached in rich spiced tomato-pepper sauce) with 1 slice multigrain toast.',
      midMorning: '1 whole fresh pomegranate or 2 peeled kiwis.',
      lunch: isVeg ? 'Hearty mixed yellow and black dal tadka with paneer cubes + 1 cup steamed basmati rice + cucumber raita.' : 'Herb-infused roasted chicken breast + 1 cup steamed basmati rice + roasted cumin cucumber raita.',
      evening: 'Antioxidant trail mix (almonds, walnuts, dried cranberries, pumpkin seeds).',
      dinner: isVeg ? 'Hearty vegetable & lentil hot pot stew with steamed broccoli, carrots, and warm turmeric golden milk before bed.' : 'Grilled white fish or chicken bone broth soup with steamed carrots, broccoli, and warm golden milk before bed.',
      calories: 2100,
      macros: { protein: '148g', carbs: '200g', fats: '58g' }
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
      exercises
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
          exercises: parsed.workoutRecommendation.exercises || fallback.workoutRecommendation.exercises
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

