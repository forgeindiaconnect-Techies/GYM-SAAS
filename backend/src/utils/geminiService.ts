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

  // Diet matching Image 3
  const isVeg = dietPref.toLowerCase().includes('veg') && !dietPref.toLowerCase().includes('non');
  const morning = isVeg 
    ? 'Warm water with pinch of pink Himalayan salt. Pre-workout (5:30 AM): 1 small banana or 2 rice cakes with a spoonful of peanut butter.'
    : 'Warm water with pinch of pink Himalayan salt. Pre-workout (5:30 AM): 1 small banana or 2 rice cakes with a spoonful of peanut butter.';

  const breakfast = isVeg
    ? 'Post-workout (7:30 AM): 3-4 whole eggs scrambled with spinach and mushrooms (or 150g paneer bhurji), 2 slices of whole-wheat toast, and fresh fruit / shake.'
    : 'Post-workout (7:30 AM): 3-4 whole eggs scrambled with spinach and mushrooms, 2 slices of whole-wheat toast, and a glass of fresh orange juice or whey protein.';

  const lunch = isVeg
    ? '150g low-fat paneer/tofu or large bowl dal/chana with a large serving (1.5 cups) of mixed green salad with olive oil and 1 cup brown rice/quinoa.'
    : '150-180g grilled chicken breast or fish (e.g., salmon/tuna) with a large serving (1.5 cups) of mixed green salad with olive oil and brown rice/quinoa.';

  const evening = isVeg
    ? 'Late Afternoon Snack (4:00 PM): 1 cup Greek yogurt with berries or a handful (30g) of almonds/walnuts. Pre-dinner (6:30 PM): Green tea.'
    : 'Late Afternoon Snack (4:00 PM): 1 cup Greek yogurt with berries or a handful (30g) of almonds/walnuts. Pre-dinner (6:30 PM): Green tea or whey shake.';

  const dinner = isVeg
    ? 'Grilled paneer/tofu with sautéed bell peppers (or lentils), minimal complex carbs (e.g., small sweet potato or half a cup of lentils), large bowl of mixed vegetable soup.'
    : 'Grilled fish / chicken tikka (150g, or paneer/tofu for vegetarian option), minimal complex carbs (e.g., small sweet potato or half a cup of lentils), large bowl of mixed vegetable soup.';

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
        timeout: 25000 // 25s timeout
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
    "morning": "Morning Hydration & Pre-workout (e.g. Warm water with pinch of pink Himalayan salt. Pre-workout: 1 small banana or 2 rice cakes with peanut butter)",
    "breakfast": "Post-workout (7:30 AM): 3-4 whole eggs scrambled with spinach and mushrooms, 2 slices whole-wheat toast, and fresh fruit / whey protein",
    "lunch": "150-180g grilled chicken/fish or paneer/tofu/lentils with a large serving (1.5 cups) mixed green salad with olive oil and brown rice/quinoa",
    "evening": "Late Afternoon Snack (4:00 PM): 1 cup Greek yogurt with berries or a handful (30g) of almonds/walnuts. Pre-dinner: Green tea",
    "dinner": "Grilled fish/chicken tikka or paneer/tofu with minimal complex carbs (e.g. small sweet potato or lentils) and mixed vegetable soup",
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
Generate exactly 9 calibrated exercises in "exercises" matching their equipment (${fitnessProfile.equipmentAvailability || 'Full Gym'}) and goal (${fitnessProfile.fitnessGoal || 'General Fitness'}).`;


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
      return {
        aiAnalysis: { ...fallback.aiAnalysis, ...parsed.aiAnalysis },
        workoutRecommendation: {
          weeklySchedule: parsed.workoutRecommendation.weeklySchedule || fallback.workoutRecommendation.weeklySchedule,
          exercises: parsed.workoutRecommendation.exercises || fallback.workoutRecommendation.exercises
        },
        dietRecommendation: { ...fallback.dietRecommendation, ...parsed.dietRecommendation },
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

