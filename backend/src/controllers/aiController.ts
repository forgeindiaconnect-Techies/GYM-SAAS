import TrainerSession from '../models/TrainerSession';
import CustomerMembership from '../models/CustomerMembership';
import Payment from '../models/Payment';
import StoreOrder from '../models/StoreOrder';
import ProgressLog from '../models/ProgressLog';
import Notification from '../models/Notification';
import WorkoutPlan from '../models/WorkoutPlan';
import Exercise from '../models/Exercise';

import { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import mongoose from 'mongoose';
import AIRecommendation from '../models/AIRecommendation';
import User from '../models/User';
import Trainer from '../models/Trainer';

// AI Generation Service (Rule-Based Expert Engine)
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
    assessment = `Customer presents with a goal of fat reduction. Focus should remain on progressive overload with moderate rest intervals (45–60s), ensuring heart rate elevation without compromising exercise form.`;
    limitations = injuries !== 'None reported' 
      ? `Reported considerations: "${injuries}". Strictly avoid ballistic impact on affected joints; substitute high-impact movements with low-impact alternatives.`
      : 'Maintain strict pelvic stability and avoid spinal flexion under fatigue. High-volume plyometrics should be phased gradually.';
  } else if (lowerGoal.includes('muscle') || lowerGoal.includes('hypertrophy') || lowerGoal.includes('weight gain')) {
    goalAnalysis = `Prioritizing mechanical tension, metabolic stress, and myofibrillar hypertrophy. Requires a slight hypercaloric surplus (+250–350 kcal/day) with high bioavailability protein (1.8g–2.2g per kg bodyweight).`;
    recommendedApproach = 'Targeted resistance split with 8–12 repetition ranges, 2–3 RIR (reps in reserve), and structured eccentric control (2–3 second tempo).';
    assessment = `Customer profile is primed for hypertrophy. Gradual volume accumulation across major muscle groups will yield optimal adaptation. Rest periods set at 60–90 seconds for ATP replenishment.`;
    limitations = injuries !== 'None reported'
      ? `Medical consideration: "${injuries}". Eliminate excessive overhead or deep compression loads where indicated. Prioritize machine guidance for stability.`
      : 'Ensure adequate scapular retraction and core bracing prior to heavy compounds. Prioritize full range of motion over absolute load.';
  } else if (lowerGoal.includes('strength')) {
    goalAnalysis = `Neuromuscular adaptation and force production focus. Low-repetition compound lifts (3–6 reps) at 75–85% 1RM with extended recovery periods.`;
    recommendedApproach = 'Linear progression model focusing on Squat, Hinge, Push, and Pull movement patterns with 90–120s inter-set recovery.';
    assessment = `Focus is neuromuscular recruitment and biomechanical proficiency. Work sets should remain strict with thorough dynamic warm-up protocols.`;
    limitations = 'Ensure mandatory spotters for maximal pressing and squatting. Deload week advised every 5th training week.';
  } else {
    goalAnalysis = `Holistic physical conditioning improving cardiovascular endurance, functional mobility, metabolic efficiency, and lean muscle tone.`;
    recommendedApproach = 'Full-body functional resistance circuit interspersed with mobility drills and active recovery periods.';
    assessment = `Well-rounded physiological conditioning program balancing joint longevity, cardiovascular output, and musculoskeletal integrity.`;
    limitations = 'Emphasize dynamic joint mobilization during warm-up. Keep heart rate within 65-75% max HR during conditioning blocks.';
  }

  // Parse workout days (default to 4)
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

  // Exercises tailored to equipment & goal
  const defaultExercises = [
    { name: 'Barbell Back Squats', sets: 4, reps: '12', duration: '12 min', rest: '75s', difficulty: level, targetMuscleGroup: 'Quads & Glutes' },
    { name: 'Dumbbell Romanian Deadlifts', sets: 3, reps: '12', duration: '10 min', rest: '60s', difficulty: level, targetMuscleGroup: 'Hamstrings & Lower Back' },
    { name: 'Incline Dumbbell Chest Press', sets: 4, reps: '10', duration: '10 min', rest: '60s', difficulty: level, targetMuscleGroup: 'Chest & Anterior Deltoids' },
    { name: 'Seated Cable Row / Lat Pulldown', sets: 4, reps: '12', duration: '10 min', rest: '60s', difficulty: level, targetMuscleGroup: 'Upper Back & Lats' },
    { name: 'Dumbbell Walking Lunges', sets: 3, reps: '12/leg', duration: '8 min', rest: '60s', difficulty: level, targetMuscleGroup: 'Quads & Glutes' },
    { name: 'Plank with Shoulder Taps', sets: 3, reps: '45 sec', duration: '6 min', rest: '45s', difficulty: level, targetMuscleGroup: 'Core & Stabilizers' }
  ];

  // Adjust for home/bodyweight if requested
  const isHomeOrBodyweight = equipment.toLowerCase().includes('home') || equipment.toLowerCase().includes('bodyweight') || equipment.toLowerCase().includes('no equipment');
  const exercises = isHomeOrBodyweight ? [
    { name: 'Bodyweight Goblet Squats', sets: 4, reps: '15', duration: '10 min', rest: '45s', difficulty: level, targetMuscleGroup: 'Quads & Glutes' },
    { name: 'Tempo Push-ups', sets: 3, reps: '12', duration: '8 min', rest: '60s', difficulty: level, targetMuscleGroup: 'Chest & Triceps' },
    { name: 'Reverse Lunges', sets: 3, reps: '14/leg', duration: '8 min', rest: '45s', difficulty: level, targetMuscleGroup: 'Hamstrings & Glutes' },
    { name: 'Glute Bridges (Hold 2s)', sets: 3, reps: '15', duration: '6 min', rest: '45s', difficulty: level, targetMuscleGroup: 'Glutes & Core' },
    { name: 'Pike Push-ups / Shoulder Taps', sets: 3, reps: '10', duration: '6 min', rest: '45s', difficulty: level, targetMuscleGroup: 'Shoulders & Core' },
    { name: 'Hollow Body Hold', sets: 3, reps: '30 sec', duration: '5 min', rest: '45s', difficulty: level, targetMuscleGroup: 'Abdominals' }
  ] : defaultExercises;

  // Diet customization
  const isVeg = dietPref.toLowerCase().includes('veg') && !dietPref.toLowerCase().includes('non');
  const morning = isVeg 
    ? 'Warm lemon water (500ml), overnight soaked chia seeds, 6 almonds, 2 walnuts' 
    : 'Warm water (500ml) with pinch of Himalayan pink salt, black coffee / green tea';

  const breakfast = isVeg
    ? 'Paneer bhurji (150g) with 2 multi-grain rotis, or 3-scoop oats with plant protein, chia, and berries'
    : '3 whole eggs + 2 egg whites omelette with spinach, 2 slices whole wheat toast, 1 apple';

  const lunch = isVeg
    ? 'Brown rice (150g) or 2 chapatis, 1 large bowl dal/chana, 100g low-fat paneer or tofu, fresh green salad'
    : 'Grilled chicken breast / fish (180g), 1 cup steamed quinoa or brown rice, roasted broccoli & zucchini';

  const evening = isVeg
    ? 'Sprouted moong salad with lemon, or roasted makhana (fox nuts) + green tea or whey protein shake'
    : 'Whey protein shake with unsweetened almond milk, or boiled egg whites (4) + cucumber slices';

  const dinner = isVeg
    ? 'Soya chunks / paneer curry (light gravy), sautéed bell peppers, 1 multigrain phulka or quinoa bowl'
    : 'Grilled fish / chicken tikka (150g), large bowl of mixed vegetable soup, steamed green beans';

  return {
    aiAnalysis: {
      fitnessSummary: `Customer: ${fitnessProfile.fullName || 'Member'} | Age: ${age} | Gender: ${gender} | Height: ${height} cm | Weight: ${weight} kg | BMI: ${bmi} | Goal: ${goal} | Level: ${level} | Equipment: ${equipment} | Chest: ${measurements.chest} | Waist: ${measurements.waist} | Hips: ${measurements.hips} | Arms: ${measurements.arms} | Thighs: ${measurements.thighs}`,
      profileSummary: `Current Weight: ${weight} kg\nTarget Weight: ${fitnessProfile.targetWeight || '-'} kg\nHeight: ${height} cm\nBMI: ${bmi}\nFitness Goal: ${goal}\nExperience Level: ${level}\nActivity Level: ${activityLevel}\nTraining Days: ${days} days/week\nEquipment: ${equipment}`,
      goalAnalysis,
      recommendedApproach,
      assessment,
      limitations,
      generalRecommendations: 'Prioritize water intake (minimum 3L/day), sleep hygiene (7-8 hrs), progressive resistance tracking, and post-workout protein timing within 90 minutes.'
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
      hydration: '3.0 – 3.5 Liters of filtered water throughout the day (500ml upon waking)',
      note: 'Draft AI nutritional suggestion based on customer profile. Requires assigned Trainer review & approval before adoption.'
    },
    recoveryRecommendations: {
      sleep: '7.5 – 8.5 hours uninterrupted sleep per night for optimal nervous system and muscular regeneration.',
      activeRecovery: '15–20 minutes low-intensity walking or light mobility on designated rest days.',
      stretchingMobility: '10 minutes dynamic warm-up pre-workout; 8 minutes static hamstring, quad, and chest stretches post-workout.',
      notes: 'If experiencing acute muscular soreness (DOMS), incorporate contrast water showers and light foam rolling.'
    },
    routine: {
      morning: 'Hydration (500ml), dynamic joint rotations, wholesome breakfast within 60 mins of waking.',
      workoutTime: '5-min dynamic warm-up, core workout blocks (45-55 mins), 5-min cool down and stretching.',
      evening: 'Nutritious snack, light mobility / steps check, hydration.',
      night: `Clean dinner at least 2 hours before bed, digital detox 30 mins before sleep (${age < 30 ? '8 hours' : '7.5 hours'} target).`
    },
    progressSuggestions: {
      focusAreas: 'Mastering compound movement technique, tracking weekly progressive overload, and logging daily nutrition.',
      improvementSuggestions: 'Gradually increase weight or reps every 7–10 days while maintaining strict biomechanical form.',
      progressTracking: 'Log weekly body weight on Monday mornings; measure waist & chest bi-weekly; update progress photos monthly.',
      startingWeight: String(weight)
    }
  };
};

/* ── 1. Customer Assessment & AI Analysis Generation ──────────────────────────── */
export const generateRecommendation = async (req: any, res: any) => {
  try {
    const fitnessProfile = req.body.fitnessProfile || (req.body.goal || req.body.fitnessGoal || req.body.age ? req.body : null);
    const customerId = req.user.id;
    const userGymId = req.user.gymId;

    if (!fitnessProfile) {
      return res.status(400).json({ success: false, message: 'Fitness profile assessment data is required' });
    }

    const userDoc = await User.findById(customerId);
    const gymId = userDoc?.gymId || userGymId;

    if (!gymId) {
      return res.status(400).json({ success: false, message: 'Gym membership context is required to generate AI plans' });
    }

    // 1. Generate complete Mock AI draft payload
    const generatedPayload = mockAIGeneration(fitnessProfile);

    // 2. Trainer Assignment Rule:
    // "Only trainers who are currently marked as Online/Available should be eligible for new customer trainer assignments."
    const onlineTrainers = await Trainer.find({
      gymId: new mongoose.Types.ObjectId(gymId),
      status: 'Active',
      availabilityStatus: 'Online'
    });

    let assignedTrainerDoc: any = null;

    // Check if customer already has an assigned trainer who is currently Online
    if (userDoc?.assignedTrainer) {
      const existingTrainer = await Trainer.findById(userDoc.assignedTrainer);
      if (existingTrainer && existingTrainer.status === 'Active' && existingTrainer.availabilityStatus === 'Online') {
        assignedTrainerDoc = existingTrainer;
      }
    }

    // If no eligible trainer assigned yet, pick an Online trainer from the gym
    if (!assignedTrainerDoc && onlineTrainers.length > 0) {
      // Pick first online trainer
      assignedTrainerDoc = onlineTrainers[0];
      if (userDoc) {
        userDoc.assignedTrainer = assignedTrainerDoc._id;
        await userDoc.save();
      }
    } else if (!assignedTrainerDoc) {
      // Fallback: check any active trainer in gym
      const anyActiveTrainer = await Trainer.findOne({
        gymId: new mongoose.Types.ObjectId(gymId),
        status: 'Active'
      });
      if (anyActiveTrainer) {
        assignedTrainerDoc = anyActiveTrainer;
      }
    }

    // 3. Versioning
    const previous = await AIRecommendation.findOne({ customerId }).sort({ createdAt: -1 });
    const newVersion = previous ? (previous.version || 1) + 1 : 1;
    const startingWeight = previous?.fitnessProfile?.weight || fitnessProfile.weight;

    if (generatedPayload.progressSuggestions) {
      (generatedPayload.progressSuggestions as any).startingWeight = String(startingWeight);
    }

    // Deep snapshot of AI-generated output for Version / Audit Tracking (Requirement 7)
    const originalAiDraft = {
      generatedAt: new Date(),
      aiAnalysis: { ...generatedPayload.aiAnalysis },
      workoutRecommendation: JSON.parse(JSON.stringify(generatedPayload.workoutRecommendation)),
      workoutPlan: JSON.parse(JSON.stringify(generatedPayload.workoutRecommendation?.exercises || [])),
      dietRecommendation: { ...generatedPayload.dietRecommendation },
      recoveryRecommendations: { ...generatedPayload.recoveryRecommendations },
      routine: { ...generatedPayload.routine }
    };

    // 4. Save new AI Recommendation
    // IMPORTANT: Treat as DRAFT! Status is 'Pending Trainer Review'. Do not mark as final!
    const newRecommendation = new AIRecommendation({
      customerId,
      gymId,
      branchId: userDoc?.branchId,
      trainerId: assignedTrainerDoc?._id || undefined,
      status: 'Pending Trainer Review',
      version: newVersion,
      fitnessProfile,
      originalAiDraft,
      workoutPlan: generatedPayload.workoutRecommendation?.exercises || [],
      ...generatedPayload,
      trainerModifications: {
        hasModifications: false,
        workoutModifications: []
      }
    });

    await newRecommendation.save();

    // 5. Send notification to Trainer
    if (assignedTrainerDoc) {
      try {
        await Notification.create({
          recipientId: assignedTrainerDoc.userId,
          recipientRole: 'TRAINER',
          gymId,
          title: 'New AI Assessment for Review',
          message: `${fitnessProfile.fullName || userDoc?.firstName || 'A customer'} submitted their fitness assessment. Review AI draft plan.`,
          type: 'info',
          relatedRecordId: newRecommendation._id,
          link: `/trainer/ai-review/${customerId}`
        });
      } catch (notifErr) {
        console.warn('Could not create notification for trainer:', notifErr);
      }
    }

    const populatedRec = await AIRecommendation.findById(newRecommendation._id)
      .populate('trainerId', 'name specialization availabilityStatus profilePhoto');

    res.status(201).json({
      success: true,
      message: 'Assessment submitted successfully! Draft AI Fitness Analysis generated and routed for Trainer Review.',
      recommendation: populatedRec || newRecommendation
    });

  } catch (error: any) {
    console.error('Error generating AI recommendation:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/* ── 2. Get Customer's Latest Recommendation (Member View) ───────────────────── */
export const getLatestRecommendation = async (req: any, res: any) => {
  try {
    const customerId = req.user.id;
    const recommendations = await AIRecommendation.find({ customerId })
      .sort({ createdAt: -1 })
      .limit(2)
      .populate('trainerId', 'name specialization profilePhoto availabilityStatus');

    if (!recommendations || recommendations.length === 0) {
      return res.status(200).json({ success: true, recommendation: null, history: [] });
    }

    const recommendation = recommendations[0];
    const history = recommendations.length > 1 ? [recommendations[1]] : [];

    // Is it approved and published to customer?
    const isApproved = recommendation.status === 'Trainer Approved' || recommendation.status === 'Published to Customer';

    res.status(200).json({
      success: true,
      recommendation,
      isApproved,
      history
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/* ── 3. Trainer Dashboard: Customers & AI Analysis Review ───────────────────────── */
export const getAssignedCustomersWithAI = async (req: any, res: any) => {
  try {
    const trainerUserId = req.user.id;
    const trainer = await Trainer.findOne({ userId: trainerUserId });
    
    if (!trainer) {
      return res.status(404).json({ success: false, message: 'Trainer profile not found' });
    }

    // Fetch members of trainer's gym
    const members = await User.find({ gymId: trainer.gymId, role: 'MEMBER' } as any).sort({ updatedAt: -1 });

    const customersWithAI = await Promise.all(members.map(async (member) => {
      const latestAI = await AIRecommendation.findOne({ customerId: member._id })
        .populate('trainerId', 'name')
        .sort({ createdAt: -1 });

      const isAssignedToThisTrainer = 
        (latestAI?.trainerId as any)?._id?.toString() === trainer._id.toString() ||
        member.assignedTrainer?.toString() === trainer._id.toString();

      return {
        _id: member._id,
        firstName: member.firstName,
        lastName: member.lastName,
        email: member.email,
        mobile: member.mobile,
        profilePhoto: member.profilePhoto,
        goal: latestAI?.fitnessProfile?.fitnessGoal || member.fitnessGoal || 'General Fitness',
        level: latestAI?.fitnessProfile?.currentFitnessLevel || latestAI?.fitnessProfile?.experienceLevel || member.experienceLevel || 'Beginner',
        aiStatus: latestAI ? latestAI.status : 'No Data',
        lastUpdated: latestAI ? latestAI.updatedAt : member.updatedAt,
        latestRecommendationId: latestAI ? latestAI._id : null,
        isAssignedToMe: isAssignedToThisTrainer,
        hasPendingReview: latestAI?.status === 'Pending Trainer Review' || latestAI?.status === 'Under Trainer Review',
        assessmentData: latestAI?.fitnessProfile || null
      };
    }));

    res.status(200).json({
      success: true,
      customers: customersWithAI,
      trainerAvailability: trainer.availabilityStatus || 'Online',
      trainerName: trainer.name
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/* ── 4. Trainer Review: Fetch Customer Recommendation for Review ──────────────── */
export const getCustomerRecommendation = async (req: any, res: any) => {
  try {
    const { customerId } = req.params;
    const recommendation = await AIRecommendation.findOne({ customerId })
      .populate('customerId', 'firstName lastName email mobile profilePhoto height weight')
      .populate('trainerId', 'name specialization availabilityStatus')
      .sort({ createdAt: -1 });
    
    if (!recommendation) {
      return res.status(404).json({ success: false, message: 'No AI recommendation found for this customer' });
    }

    // If currently 'Pending Trainer Review', transition to 'Under Trainer Review' as trainer opened it
    if (recommendation.status === 'Pending Trainer Review') {
      recommendation.status = 'Under Trainer Review';
      await recommendation.save();
    }

    res.status(200).json({ success: true, recommendation });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/* ── 5. Trainer Review & Decision (Approve & Publish OR Edit & Approve) ────────── */
export const reviewRecommendation = async (req: any, res: any) => {
  try {
    const { id } = req.params; // Recommendation ID
    const trainerUserId = req.user.id;
    
    const trainer = await Trainer.findOne({ userId: trainerUserId });
    if (!trainer) {
      return res.status(404).json({ success: false, message: 'Trainer profile not found' });
    }

    const recommendation = await AIRecommendation.findById(id);
    if (!recommendation) {
      return res.status(404).json({ success: false, message: 'AI Recommendation record not found' });
    }

    const action = req.body.action || 'EDIT_AND_APPROVE';
    const rawWorkout = req.body.workoutRecommendation || req.body.workoutPlan;
    const workoutRecommendation = rawWorkout && Array.isArray(rawWorkout)
      ? { weeklySchedule: recommendation.workoutRecommendation?.weeklySchedule || [], exercises: rawWorkout }
      : (rawWorkout || recommendation.workoutRecommendation);

    const dietRecommendation = req.body.dietRecommendation || req.body.dietRecommendations || recommendation.dietRecommendation;
    const recoveryRecommendations = req.body.recoveryRecommendations || recommendation.recoveryRecommendations;
    const routine = req.body.routine || recommendation.routine;
    const progressSuggestions = req.body.progressSuggestions || recommendation.progressSuggestions;
    const trainerRecommendations = req.body.trainerRecommendations || '';
    const trainerNotes = req.body.trainerNotes || '';
    const status = req.body.status || 'Trainer Approved';
    const revisionDetails = req.body.revisionDetails;

    const originalDraft = recommendation.originalAiDraft || {
      workoutRecommendation: recommendation.workoutRecommendation,
      dietRecommendation: recommendation.dietRecommendation,
      recoveryRecommendations: recommendation.recoveryRecommendations,
    };

    // Calculate Workout Modifications Diff (Requirement 7)
    const workoutModifications: any[] = [];
    let hasModifications = false;

    const originalExercises = originalDraft.workoutRecommendation?.exercises || 
      (Array.isArray((originalDraft as any).workoutPlan) ? (originalDraft as any).workoutPlan : (recommendation.workoutRecommendation?.exercises || []));
    const updatedExercises = workoutRecommendation?.exercises || 
      (Array.isArray(rawWorkout) ? rawWorkout : []);

    if (action === 'EDIT_AND_APPROVE' || req.body.hasModifications) {
      hasModifications = true;

      // Check each exercise for edits or replacements
      updatedExercises.forEach((newEx: any) => {
        const origEx = originalExercises.find((oe: any) => oe.name?.toLowerCase() === newEx.name?.toLowerCase());
        if (!origEx) {
          workoutModifications.push({
            exerciseName: newEx.name,
            changeType: 'added',
            newSets: newEx.sets,
            newReps: newEx.reps,
            newDuration: newEx.duration,
            newDifficulty: newEx.difficulty,
            details: `Added new exercise: ${newEx.name} (${newEx.sets} sets × ${newEx.reps} reps)`
          });
        } else {
          const setsChanged = String(origEx.sets) !== String(newEx.sets);
          const repsChanged = String(origEx.reps) !== String(newEx.reps);
          const durationChanged = String(origEx.duration) !== String(newEx.duration);
          const diffChanged = String(origEx.difficulty) !== String(newEx.difficulty);

          if (setsChanged || repsChanged || durationChanged || diffChanged) {
            workoutModifications.push({
              exerciseName: newEx.name,
              changeType: 'modified',
              originalSets: origEx.sets,
              newSets: newEx.sets,
              originalReps: origEx.reps,
              newReps: newEx.reps,
              originalDuration: origEx.duration,
              newDuration: newEx.duration,
              originalDifficulty: origEx.difficulty,
              newDifficulty: newEx.difficulty,
              details: `Changed from [${origEx.sets} sets × ${origEx.reps}] to [${newEx.sets} sets × ${newEx.reps}]`
            });
          }
        }
      });

      // Check for removed exercises
      originalExercises.forEach((origEx: any) => {
        const exists = updatedExercises.some((ne: any) => ne.name?.toLowerCase() === origEx.name?.toLowerCase());
        if (!exists) {
          workoutModifications.push({
            exerciseName: origEx.name,
            changeType: 'removed',
            originalSets: origEx.sets,
            originalReps: origEx.reps,
            details: `Removed AI recommendation: ${origEx.name}`
          });
        }
      });
    }

    // Determine final status based on action & workflow progression
    const finalStatus = 'Trainer Approved';

    // Store Trainer Modifications separately (Requirement 4, 5, 7)
    recommendation.trainerModifications = {
      modifiedByTrainerId: trainer._id as any,
      modifiedByTrainerName: trainer.name,
      modifiedAt: new Date(),
      hasModifications,
      workoutModifications,
      dietModifications: dietRecommendation ? JSON.stringify(dietRecommendation) : '',
      recoveryModifications: recoveryRecommendations ? JSON.stringify(recoveryRecommendations) : '',
      trainerSpecificRecommendations: trainerRecommendations || '',
      trainerNotes: trainerNotes || '',
      summaryNotes: hasModifications 
        ? `Trainer modified ${workoutModifications.length} exercise parameter(s) and customized recommendations.`
        : 'Approved as recommended by AI without modifications.'
    };

    // Update current active recommendation fields
    if (workoutRecommendation) recommendation.workoutRecommendation = workoutRecommendation;
    if (dietRecommendation) recommendation.dietRecommendation = dietRecommendation;
    if (recoveryRecommendations) recommendation.recoveryRecommendations = recoveryRecommendations;
    if (routine) recommendation.routine = routine;
    if (progressSuggestions) recommendation.progressSuggestions = progressSuggestions;
    if (trainerRecommendations) recommendation.trainerRecommendations = trainerRecommendations;
    if (trainerNotes) recommendation.trainerNotes = trainerNotes;

    recommendation.trainerId = trainer._id as any;
    recommendation.status = finalStatus;
    recommendation.approvedAt = new Date();

    const finalExercises = (recommendation.workoutRecommendation?.exercises && recommendation.workoutRecommendation.exercises.length > 0)
      ? recommendation.workoutRecommendation.exercises
      : (recommendation.workoutPlan || []);

    if (finalExercises.length > 0) {
      recommendation.workoutPlan = finalExercises;
    }

    // Generate Final Approved Customer Output (Requirement 6 & 7)
    recommendation.finalApprovedPlan = {
      approvedAt: new Date(),
      approvedByTrainerId: trainer._id as any,
      approvedByTrainerName: trainer.name,
      publishedAt: new Date(),
      fitnessSummary: req.body.summary || recommendation.aiAnalysis?.fitnessSummary || `Plan approved for ${recommendation.fitnessProfile?.fullName || 'Member'}`,
      workoutPlan: {
        weeklySchedule: recommendation.workoutRecommendation?.weeklySchedule || [],
        exercises: finalExercises
      },
      dietPlan: recommendation.dietRecommendation,
      recoveryPlan: recommendation.recoveryRecommendations,
      trainerRecommendations: trainerRecommendations || '',
      trainerNotes: trainerNotes || ''
    };

    await recommendation.save();

    // Auto-create / synchronize structured customer WorkoutPlan in WorkoutPlan collection
    // so member workout tracker and video player sync seamlessly
    try {
      const gymId = recommendation.gymId;
      const customerId = recommendation.customerId;

      // Find exercises in gym catalog to link
      const gymExercises = await Exercise.find({ gymId, status: 'Active' });
      const currentExercises = recommendation.workoutRecommendation?.exercises || [];

      const workoutDays = (recommendation.workoutRecommendation?.weeklySchedule || []).map((dayItem: any) => {
        const dayExercises = currentExercises.slice(0, 5).map((ex: any, idx: number) => {
          const matched = gymExercises.find((ge: any) => 
            ge.name.toLowerCase().includes(ex.name.toLowerCase()) || 
            ex.name.toLowerCase().includes(ge.name.toLowerCase())
          ) || (gymExercises.length > 0 ? gymExercises[idx % gymExercises.length] : null);

          return {
            exerciseId: matched ? matched._id : new mongoose.Types.ObjectId(),
            order: idx + 1,
            sets: Number(ex.sets) || 3,
            repetitions: parseInt(ex.reps) || 12,
            duration: parseInt(ex.duration) || 60,
            restTime: parseInt(ex.rest) || 30,
            trainerNotes: `Trainer Approved: ${ex.name} (${ex.sets} sets × ${ex.reps}).`
          };
        }).filter((item: any) => item.exerciseId);

        return {
          dayName: `${dayItem.day} – ${dayItem.workout}`,
          focus: dayItem.workout,
          exercises: dayExercises
        };
      });

      // Archive any prior published workout plans for this customer
      await WorkoutPlan.updateMany(
        { customerId, status: 'Published' },
        { $set: { status: 'Archived' } }
      );

      const publishedWorkoutPlan = new WorkoutPlan({
        customerId,
        trainerId: trainer.userId || trainerUserId,
        gymId,
        planName: `${trainer.name}'s Approved Plan: ${recommendation.fitnessProfile?.fitnessGoal || 'Fitness'} Routine`,
        description: `Trainer approved fitness routine customized by ${trainer.name}.`,
        status: 'Published',
        workoutDays,
        aiRecommendationId: recommendation._id,
        publishedAt: new Date()
      });

      await publishedWorkoutPlan.save();
    } catch (wpErr) {
      console.warn('Could not auto-sync WorkoutPlan collection:', wpErr);
    }

    // Send notification to member
    try {
      await Notification.create({
        recipientId: recommendation.customerId,
        recipientRole: 'MEMBER',
        gymId: recommendation.gymId,
        title: 'Fitness Plan Approved!',
        message: `Your trainer ${trainer.name} has approved and published your personalized fitness plan. View it now!`,
        type: 'success',
        relatedRecordId: recommendation._id,
        link: '/member/workout'
      });
    } catch (notifErr) {
      console.warn('Could not notify member:', notifErr);
    }

    const populated = await AIRecommendation.findById(recommendation._id)
      .populate('customerId', 'firstName lastName email profilePhoto')
      .populate('trainerId', 'name specialization availabilityStatus');

    res.status(200).json({
      success: true,
      message: hasModifications 
        ? 'Trainer modifications saved. Plan approved and published to customer!' 
        : 'AI output approved and published to customer without modifications!',
      recommendation: populated || recommendation
    });

  } catch (error: any) {
    console.error('Error reviewing recommendation:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/* ── 6. Get Trainer's Recommendations List ─────────────────────────────────────── */
export const getTrainerRecommendations = async (req: any, res: any) => {
  try {
    const trainerUserId = req.user.id;
    const userGymId = req.user.gymId;
    const trainer = await Trainer.findOne({ userId: trainerUserId });

    const gymId = trainer?.gymId || userGymId;

    const filterConditions: any[] = [];
    if (trainer?._id) filterConditions.push({ trainerId: trainer._id });
    if (gymId) filterConditions.push({ gymId });

    const query = filterConditions.length > 0 ? { $or: filterConditions } : {};

    const recommendations = await AIRecommendation.find({
      ...query,
      status: { $ne: 'Archived' }
    })
      .populate('customerId', 'firstName lastName profilePhoto email mobile')
      .populate('trainerId', 'name specialization availabilityStatus')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, recommendations });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/* ── 7. Gym Owner / Admin Endpoints (Requirement 9 & 7: Audit Tracking) ───────── */
export const getAdminRecommendations = async (req: any, res: any) => {
  try {
    let gymId = req.user.gymId;
    if (!gymId && req.user.role === 'GYM_OWNER') {
      const gym = await mongoose.model('Gym').findOne({ ownerId: req.user.id });
      if (gym) gymId = gym._id;
    }
    
    if (!gymId) {
      return res.status(400).json({ success: false, message: 'Gym ID is required' });
    }
    
    // Group by customer to get the latest recommendation per customer
    const recommendations = await AIRecommendation.aggregate([
      { $match: { gymId: new mongoose.Types.ObjectId(gymId) } },
      { $sort: { createdAt: -1 } },
      { 
        $group: {
          _id: "$customerId",
          latestRecommendation: { $first: "$$ROOT" }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'customer'
        }
      },
      {
        $lookup: {
          from: 'trainers',
          localField: 'latestRecommendation.trainerId',
          foreignField: '_id',
          as: 'trainer'
        }
      },
      { $unwind: "$customer" },
      { $unwind: { path: "$trainer", preserveNullAndEmptyArrays: true } }
    ]);

    res.status(200).json(recommendations);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getAdminRecommendationDetails = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    let gymId = req.user.gymId;
    if (!gymId && req.user.role === 'GYM_OWNER') {
      const gym = await mongoose.model('Gym').findOne({ ownerId: req.user.id });
      if (gym) gymId = gym._id;
    }
    
    if (!gymId) {
      return res.status(400).json({ success: false, message: 'Gym ID is required' });
    }
    
    // Get the specified recommendation with customer and trainer details
    const recommendation = await AIRecommendation.findOne({ _id: id, gymId })
      .populate('customerId', 'firstName lastName name email profileImage profilePhoto height weight mobile')
      .populate('trainerId', 'name profileImage profilePhoto availabilityStatus specialization');
      
    if (!recommendation) {
      return res.status(404).json({ success: false, message: 'Recommendation not found' });
    }
    
    // Get the version history for this customer
    const history = await AIRecommendation.find({ customerId: recommendation.customerId, gymId })
      .sort({ createdAt: -1 })
      .populate('trainerId', 'name');

    res.status(200).json({
      success: true,
      recommendation,
      history,
      originalAiDraft: recommendation.originalAiDraft || null,
      trainerModifications: recommendation.trainerModifications || null,
      finalApprovedPlan: recommendation.finalApprovedPlan || null
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/* ── 8. Member reply to trainer ─────────────────────────────────── */
export const memberReplyToTrainer = async (req: ExpressRequest, res: ExpressResponse) => {
  try {
    const userId = (req as any).user?.id;
    const gymId  = (req as any).user?.gymId;
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Reply message is required.' });
    }

    const recommendation = await AIRecommendation.findOne({
      customerId: userId,
      gymId,
    }).sort({ createdAt: -1 });

    if (!recommendation) {
      return res.status(404).json({ message: 'No AI plan found to reply to.' });
    }

    const userObj = await User.findById(userId).select('firstName lastName');
    const memberName = userObj ? `${userObj.firstName || ''} ${userObj.lastName || ''}`.trim() : 'Member';

    recommendation.memberReply = {
      message: message.trim(),
      date: new Date(),
    };

    if (!recommendation.chatMessages) recommendation.chatMessages = [];
    recommendation.chatMessages.push({
      senderRole: 'MEMBER',
      senderName: memberName,
      message: message.trim(),
      date: new Date()
    });

    await recommendation.save();

    res.status(200).json({ message: 'Reply sent to trainer successfully.', recommendation });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

/* ── 9. Trainer reply to member ─────────────────────────────────── */
export const trainerReplyToMember = async (req: ExpressRequest, res: ExpressResponse) => {
  try {
    const trainerUserId = (req as any).user?.id;
    const { recommendationId, message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Reply message is required.' });
    }

    if (!recommendationId) {
      return res.status(400).json({ message: 'recommendationId is required.' });
    }

    const recommendation = await AIRecommendation.findById(recommendationId);

    if (!recommendation) {
      return res.status(404).json({ message: 'Recommendation not found.' });
    }

    const trainerDoc = await Trainer.findOne({ userId: trainerUserId });
    const trainerUser = await User.findById(trainerUserId).select('firstName lastName');
    const trainerName = trainerDoc?.name || (trainerUser ? `${trainerUser.firstName || ''} ${trainerUser.lastName || ''}`.trim() : 'Trainer');

    if (trainerDoc && !recommendation.trainerId) {
      recommendation.trainerId = trainerDoc._id as any;
    }

    recommendation.trainerReply = {
      message: message.trim(),
      date: new Date(),
    };

    if (!recommendation.chatMessages) recommendation.chatMessages = [];
    recommendation.chatMessages.push({
      senderRole: 'TRAINER',
      senderName: trainerName,
      message: message.trim(),
      date: new Date()
    });

    await recommendation.save();

    const populatedRec = await AIRecommendation.findById(recommendation._id)
      .populate('customerId', 'firstName lastName profilePhoto email')
      .populate('trainerId', 'name');

    res.status(200).json({ message: 'Reply sent to member successfully.', recommendation: populatedRec || recommendation });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

/* ── 10. Context-Aware Customer AI Chatbot ──────────────────────────── */
export const memberChatbotQuery = async (req: ExpressRequest, res: ExpressResponse) => {
  try {
    const customerId = (req as any).user?.id;
    if (!customerId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const { message } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ success: false, message: 'Message text is required' });
    }

    const q = message.trim().toLowerCase();

    const [userDoc, sessions, memberships, orders, payments, recommendations, progressLogs, notifications] = await Promise.all([
      User.findById(customerId).populate('assignedTrainer').lean(),
      TrainerSession.find({ customerId }).populate('trainerId').sort({ date: 1, startTime: 1 }).lean(),
      CustomerMembership.find({ customerId }).sort({ createdAt: -1 }).lean(),
      StoreOrder.find({ customerId }).sort({ createdAt: -1 }).lean(),
      Payment.find({ customerId }).sort({ createdAt: -1 }).lean(),
      AIRecommendation.findOne({ customerId }).sort({ createdAt: -1 }).lean(),
      ProgressLog.find({ customerId }).sort({ date: -1 }).limit(5).lean(),
      Notification.find({ recipientId: customerId, isRead: false }).limit(5).lean()
    ]);

    if (!userDoc) {
      return res.status(404).json({ success: false, message: 'Customer profile not found' });
    }

    const userAny = userDoc as any;

    let trainerInfo: any = null;
    if (userAny.assignedTrainer) {
      trainerInfo = userAny.assignedTrainer;
      if (trainerInfo.userId) {
        const trainerUser = await User.findById(trainerInfo.userId).select('firstName lastName email mobile').lean();
        if (trainerUser) {
          trainerInfo = { ...trainerInfo, ...(trainerUser as any) };
        }
      }
    }
    if (!trainerInfo && sessions && sessions.length > 0) {
      const latestWithTrainer = sessions.find((s: any) => s.trainerId);
      if (latestWithTrainer && latestWithTrainer.trainerId) {
        trainerInfo = latestWithTrainer.trainerId;
      }
    }

    const formatDateStr = (d: string | Date) => {
      if (!d) return '';
      const dt = new Date(d);
      if (isNaN(dt.getTime())) return String(d);
      return dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    let reply = '';

    if (q.includes('booking') && q.includes('status')) {
      reply = sessions && sessions.length > 0 ? `Your session status is ${sessions[0].status}.` : "You have no upcoming sessions.";
    } else if (q.includes('workout plan') || q.includes('plan')) {
      const rec = recommendations as any;
      if (rec && rec.status === 'Trainer Approved') {
        reply = `Your trainer-approved plan for **${rec.fitnessProfile?.fitnessGoal || 'fitness'}** is active! Check My Fitness Plan for full details.`;
      } else if (rec) {
        reply = `Your AI Assessment is currently **${rec.status}**. Your trainer will finalize your plan shortly!`;
      } else {
        reply = "You haven't completed your fitness assessment yet. Go to AI Fitness to submit your assessment.";
      }
    } else {
      reply = "I am your AI Gym Assistant. I can assist you with your workout plans, trainer status, schedules, and progress!";
    }

    return res.status(200).json({
      success: true,
      reply,
      userContext: {
        firstName: userAny.firstName,
        subscriptionPlan: userAny.subscriptionPlan,
        hasTrainer: !!trainerInfo
      }
    });
  } catch (error: any) {
    console.error('Member Chatbot Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process AI Assistant message',
      error: error.message
    });
  }
};
