import { Response } from 'express';
import WorkoutProgress from '../models/WorkoutProgress';
import WorkoutPlan from '../models/WorkoutPlan';
import Exercise from '../models/Exercise';
import User, { Role } from '../models/User';
import Gym from '../models/Gym';
import Trainer from '../models/Trainer';
import AIRecommendation from '../models/AIRecommendation';
import { AuthRequest } from '../middlewares/auth';
import mongoose from 'mongoose';

// Safe populate helper that never throws CastError on non-ObjectId strings
export const safePopulateProgress = async (docs: any[]) => {
  if (!docs || !docs.length) return [];

  // Extract only VALID ObjectIds for bulk lookup
  const validExerciseIds = Array.from(new Set(
    docs
      .map(d => d.exerciseId)
      .filter(id => id && mongoose.Types.ObjectId.isValid(String(id)))
      .map(id => String(id))
  ));

  const validPlanIds = Array.from(new Set(
    docs
      .map(d => d.workoutPlanId)
      .filter(id => id && mongoose.Types.ObjectId.isValid(String(id)))
      .map(id => String(id))
  ));

  const validCustomerIds = Array.from(new Set(
    docs
      .map(d => d.customerId)
      .filter(id => id && mongoose.Types.ObjectId.isValid(String(id)))
      .map(id => String(id))
  ));

  let exercises: any[] = [];
  let plans: any[] = [];
  let customers: any[] = [];

  try {
    [exercises, plans, customers] = await Promise.all([
      validExerciseIds.length
        ? Exercise.find({ _id: { $in: validExerciseIds } }).select('name category targetMuscle difficulty thumbnailUrl videoUrl')
        : [],
      validPlanIds.length
        ? WorkoutPlan.find({ _id: { $in: validPlanIds } }).select('planName')
        : [],
      validCustomerIds.length
        ? User.find({ _id: { $in: validCustomerIds } }).select('firstName lastName email profilePhoto')
        : []
    ]);
  } catch (err) {
    console.warn('safePopulateProgress bulk fetch notice:', err);
  }

  const exerciseMap = new Map(exercises.map(e => [e._id.toString(), e]));
  const planMap = new Map(plans.map(p => [p._id.toString(), p]));
  const customerMap = new Map(customers.map(c => [c._id.toString(), c]));

  return docs.map(doc => {
    const item = doc.toObject ? doc.toObject() : { ...doc };

    // Resolve exercise
    const exIdStr = item.exerciseId ? String(item.exerciseId) : (item.exerciseCustomId || '');
    const exDoc = (exIdStr && exerciseMap.get(exIdStr)) || null;

    if (exDoc) {
      item.exerciseId = exDoc;
    } else {
      item.exerciseId = {
        _id: item.exerciseCustomId || item.exerciseId || 'custom-ex',
        name: item.exerciseName || 'Exercise',
        category: 'Strength & Conditioning',
        targetMuscle: 'Target Muscle',
        difficulty: 'All Levels'
      };
    }

    // Resolve plan
    const planIdStr = item.workoutPlanId ? String(item.workoutPlanId) : '';
    const planDoc = (planIdStr && planMap.get(planIdStr)) || null;
    if (planDoc) {
      item.workoutPlanId = planDoc;
    } else {
      item.workoutPlanId = {
        _id: item.workoutPlanId || 'standard-plan',
        planName: 'Assigned Workout Plan'
      };
    }

    // Resolve customer
    const custIdStr = item.customerId ? String(item.customerId) : '';
    const custDoc = (custIdStr && customerMap.get(custIdStr)) || null;
    if (custDoc) {
      item.customerId = custDoc;
    }

    return item;
  });
};

// 1. Log Workout / Exercise Completion (Customer)
export const logWorkoutProgress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const {
      workoutPlanId,
      exerciseId,
      exerciseName,
      dayName,
      completedSets,
      totalSets,
      completedRepetitions,
      targetRepetitions,
      duration,
      status,
      notes
    } = req.body;

    let plan: any = null;
    if (workoutPlanId && mongoose.Types.ObjectId.isValid(workoutPlanId)) {
      try {
        plan = await WorkoutPlan.findById(workoutPlanId);
      } catch (err) {
        console.warn('WorkoutPlan findById notice:', err);
      }
    }

    let exercise: any = null;
    if (exerciseId && mongoose.Types.ObjectId.isValid(exerciseId)) {
      try {
        exercise = await Exercise.findById(exerciseId);
      } catch (err) {
        console.warn('Exercise findById notice:', err);
      }
    }

    if (!exercise && exerciseName) {
      try {
        exercise = await Exercise.findOne({ name: { $regex: new RegExp(`^${exerciseName.trim()}$`, 'i') } });
      } catch (err) {
        // non-blocking
      }
    }

    let gymId = plan?.gymId || user.gymId;
    let trainerId: any = plan?.trainerId;

    if (!gymId) {
      try {
        const userDoc = await User.findById(user.id).select('gymId assignedTrainer');
        gymId = userDoc?.gymId;
        if (!trainerId) trainerId = userDoc?.assignedTrainer;
      } catch (err) {
        // non-blocking
      }
    }

    if (!gymId) {
      try {
        const anyGym = await Gym.findOne().select('_id');
        gymId = anyGym?._id;
      } catch (err) {
        // non-blocking
      }
    }

    const isExerciseObjectId = exerciseId && mongoose.Types.ObjectId.isValid(exerciseId);
    const finalExerciseId = exercise?._id || (isExerciseObjectId ? new mongoose.Types.ObjectId(exerciseId) : undefined);
    
    const isPlanObjectId = workoutPlanId && mongoose.Types.ObjectId.isValid(workoutPlanId);
    const finalPlanId = plan?._id || (isPlanObjectId ? new mongoose.Types.ObjectId(workoutPlanId) : undefined);
    const resolvedExerciseName = exercise?.name || exerciseName || 'Exercise';

    const progress = new WorkoutProgress({
      customerId: user.id,
      workoutPlanId: finalPlanId || undefined,
      exerciseId: finalExerciseId || undefined,
      exerciseCustomId: String(exerciseId || ''),
      exerciseName: resolvedExerciseName,
      gymId: gymId && mongoose.Types.ObjectId.isValid(gymId) ? new mongoose.Types.ObjectId(gymId) : undefined,
      trainerId: trainerId && mongoose.Types.ObjectId.isValid(trainerId) ? new mongoose.Types.ObjectId(trainerId) : undefined,
      dayName: dayName || 'General',
      completedSets: Number(completedSets) || 1,
      totalSets: Number(totalSets) || exercise?.defaultSets || 3,
      completedRepetitions: Number(completedRepetitions) || 12,
      targetRepetitions: Number(targetRepetitions) || exercise?.defaultRepetitions || 12,
      duration: Number(duration) || 0,
      status: status || 'Completed',
      notes: notes || '',
      completedAt: new Date()
    });

    await progress.save();

    res.status(201).json({
      success: true,
      message: 'Exercise completion tracked successfully!',
      progress
    });
  } catch (error: any) {
    console.error('Error logging workout progress:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// 2. Get Customer's Personal Progress & Stats (Customer view)
export const getMyProgress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const customerId = req.user?.id;
    if (!customerId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const rawHistory = await WorkoutProgress.find({ customerId })
      .sort({ completedAt: -1 })
      .limit(50);

    const history = await safePopulateProgress(rawHistory);

    // Calculate aggregated statistics
    const totalExercisesCompleted = await WorkoutProgress.countDocuments({
      customerId,
      status: 'Completed'
    });

    // Total workout time in seconds and full logs for matching
    const allLogs = await WorkoutProgress.find({ customerId, status: 'Completed' })
      .select('duration completedAt exerciseId exerciseCustomId exerciseName completedSets dayName');
    const totalDurationSeconds = allLogs.reduce((acc, curr) => acc + (curr.duration || 0), 0);
    const totalDurationMinutes = Math.round(totalDurationSeconds / 60);

    // Unique workout days (count distinct dates)
    const uniqueDays = new Set(allLogs.map(l => new Date(l.completedAt).toISOString().split('T')[0]));
    const totalWorkouts = uniqueDays.size;

    // Weekly workout count (past 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const weeklyLogs = allLogs.filter(l => new Date(l.completedAt) >= sevenDaysAgo);
    const weeklyWorkoutDays = new Set(weeklyLogs.map(l => new Date(l.completedAt).toISOString().split('T')[0])).size;

    // Calculate workout streak
    let streak = 0;
    const sortedDays = Array.from(uniqueDays).sort().reverse();
    const todayStr = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (sortedDays.includes(todayStr) || sortedDays.includes(yesterdayStr)) {
      let checkDate = new Date();
      if (!sortedDays.includes(todayStr)) {
        checkDate.setDate(checkDate.getDate() - 1);
      }
      while (true) {
        const dStr = checkDate.toISOString().split('T')[0];
        if (sortedDays.includes(dStr)) {
          streak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    // Load customer's active plan
    const activePlanData = await getCustomerWorkoutDays(customerId);

    // Build Day Breakdown
    const dayBreakdown: Record<string, any> = {};
    DAYS_ORDER.forEach(d => {
      dayBreakdown[d] = {
        day: d,
        focus: '',
        totalExercises: 0,
        completedExercises: 0,
        completedSets: 0,
        totalDurationMinutes: 0,
        completionPercentage: 0,
        exercises: []
      };
    });

    let totalPlanExercises = 0;
    const planExerciseList: any[] = [];

    activePlanData.workoutDays.forEach((day, dayIndex) => {
      const canonicalDay = getCanonicalDay(day.dayName, dayIndex);
      if (dayBreakdown[canonicalDay]) {
        dayBreakdown[canonicalDay].focus = day.focus || day.dayName;
      }

      const matchedLogIds = new Set<string>();

      day.exercises.forEach((ex: any) => {
        totalPlanExercises++;
        const exIdStr = ex._id?.toString();

        const matchingLog = allLogs.find(l => {
          const lDay = (l.dayName || '').toLowerCase().trim();
          const canonicalLower = canonicalDay.toLowerCase().trim();
          const matchesDay = !lDay || lDay === 'general' || lDay.includes(canonicalLower) || canonicalLower.includes(lDay);
          if (!matchesDay) return false;

          const matchesId = exIdStr && (l.exerciseId?.toString() === exIdStr || l.exerciseCustomId === exIdStr);
          const lName = (l.exerciseName || (l.exerciseId as any)?.name || '').toLowerCase().trim();
          const exName = (ex.name || '').toLowerCase().trim();
          const matchesName = lName && exName && (lName === exName || lName.includes(exName) || exName.includes(lName));

          return matchesId || matchesName;
        });

        if (matchingLog) {
          matchedLogIds.add(matchingLog._id.toString());
        }

        const isCompleted = !!matchingLog;

        const exerciseItem = {
          exerciseId: ex._id,
          name: ex.name,
          category: ex.category || 'General',
          targetMuscle: ex.targetMuscle || 'Muscles',
          sets: ex.sets || 3,
          reps: ex.repetitions || 12,
          targetDuration: ex.duration || 60,
          day: canonicalDay,
          rawDayName: day.dayName,
          isCompleted,
          completedSets: matchingLog?.completedSets || (isCompleted ? ex.sets : 0),
          duration: matchingLog?.duration || 60,
          completedAt: matchingLog?.completedAt || null
        };

        planExerciseList.push(exerciseItem);

        if (dayBreakdown[canonicalDay]) {
          dayBreakdown[canonicalDay].totalExercises++;
          if (isCompleted) {
            dayBreakdown[canonicalDay].completedExercises++;
            dayBreakdown[canonicalDay].completedSets += (matchingLog?.completedSets || ex.sets || 3);
            dayBreakdown[canonicalDay].totalDurationMinutes += Math.round((matchingLog?.duration || 60) / 60);
          }
          dayBreakdown[canonicalDay].exercises.push(exerciseItem);
        }
      });

      // Also append any completed logs for this day that were not in the template plan list
      const dayLogs = allLogs.filter(l => {
        if (matchedLogIds.has(l._id.toString())) return false;
        const lDay = (l.dayName || '').toLowerCase().trim();
        const canonicalLower = canonicalDay.toLowerCase().trim();
        return lDay && (lDay.includes(canonicalLower) || canonicalLower.includes(lDay));
      });

      dayLogs.forEach(l => {
        const lName = l.exerciseName || (l.exerciseId as any)?.name || 'Completed Exercise';
        const alreadyInList = dayBreakdown[canonicalDay].exercises.some(
          (item: any) => item.name.toLowerCase().trim() === lName.toLowerCase().trim()
        );

        if (!alreadyInList) {
          const completedItem = {
            exerciseId: l.exerciseCustomId || l.exerciseId || `log-${l._id}`,
            name: lName,
            category: 'Conditioning',
            targetMuscle: 'Target Muscle',
            sets: l.completedSets || 3,
            reps: `${l.completedRepetitions || 12}`,
            targetDuration: l.duration || 60,
            day: canonicalDay,
            rawDayName: canonicalDay,
            isCompleted: true,
            completedSets: l.completedSets || 3,
            duration: l.duration || 60,
            completedAt: l.completedAt
          };

          dayBreakdown[canonicalDay].totalExercises++;
          dayBreakdown[canonicalDay].completedExercises++;
          dayBreakdown[canonicalDay].completedSets += (l.completedSets || 3);
          dayBreakdown[canonicalDay].totalDurationMinutes += Math.round((l.duration || 60) / 60);
          dayBreakdown[canonicalDay].exercises.push(completedItem);
          planExerciseList.push(completedItem);
          totalPlanExercises++;
        }
      });
    });

    // Compute percentage for each day
    DAYS_ORDER.forEach(d => {
      const b = dayBreakdown[d];
      b.completionPercentage = b.totalExercises > 0
        ? Math.min(100, Math.round((b.completedExercises / b.totalExercises) * 100))
        : 0;
    });

    const completedCount = planExerciseList.filter(p => p.isCompleted).length;
    const completionPercentage = totalPlanExercises > 0
      ? Math.min(100, Math.round((completedCount / totalPlanExercises) * 100))
      : (totalWorkouts > 0 ? 100 : 0);

    const sanitizedHistory = history.map((doc: any) => {
      const item = doc.toObject ? doc.toObject() : { ...doc };
      if (!item.exerciseId || typeof item.exerciseId === 'string' || !item.exerciseId.name) {
        item.exerciseId = {
          _id: item.exerciseCustomId || item.exerciseId || 'custom-ex',
          name: item.exerciseName || 'Exercise',
          category: 'Strength & Conditioning',
          targetMuscle: 'Target Muscle',
          difficulty: 'All Levels'
        };
      }
      return item;
    });

    res.status(200).json({
      success: true,
      stats: {
        totalWorkouts,
        totalExercisesCompleted,
        weeklyWorkoutCount: weeklyWorkoutDays,
        workoutStreak: streak,
        totalWorkoutMinutes: totalDurationMinutes,
        completionPercentage,
        totalPlanExercises,
        completedCount
      },
      activePlan: {
        planName: activePlanData.planName,
        status: activePlanData.status,
        totalExercises: totalPlanExercises
      },
      dayBreakdown,
      planExerciseList,
      history: sanitizedHistory
    });
  } catch (error: any) {
    console.error('Error fetching member progress:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const DAYS_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const getCanonicalDay = (dayName: string, index: number): string => {
  const lower = (dayName || '').toLowerCase();
  for (const d of DAYS_ORDER) {
    if (lower.includes(d.toLowerCase())) return d;
  }
  return DAYS_ORDER[index % 7];
};

const DEFAULT_ROUTINE: Record<string, Array<{ name: string; sets: number; reps: string; targetMuscle: string; category: string }>> = {
  Monday: [
    { name: 'Flat Barbell Bench Press', sets: 4, reps: '8 - 10', targetMuscle: 'Chest, Triceps', category: 'Strength' },
    { name: 'Incline Dumbbell Bench Press', sets: 3, reps: '10 - 12', targetMuscle: 'Upper Chest, Deltoids', category: 'Strength' },
    { name: 'Standing Overhead Dumbbell Shoulder Press', sets: 3, reps: '10 - 12', targetMuscle: 'Deltoids, Shoulders', category: 'Strength' },
    { name: 'Cable Tricep Rope Pushdowns', sets: 3, reps: '12 - 15', targetMuscle: 'Triceps', category: 'Isolation' }
  ],
  Tuesday: [
    { name: 'Lat Pulldowns', sets: 4, reps: '10 - 12', targetMuscle: 'Lats, Upper Back', category: 'Hypertrophy' },
    { name: 'Seated Cable Row', sets: 3, reps: '10 - 12', targetMuscle: 'Rhomboids, Mid-Back', category: 'Hypertrophy' },
    { name: 'Standing Dumbbell Bicep Curls', sets: 3, reps: '12 - 15', targetMuscle: 'Biceps Brachii', category: 'Isolation' },
    { name: 'Overhead Dumbbell Shoulder Press', sets: 3, reps: '10 - 12', targetMuscle: 'Anterior & Lateral Deltoids', category: 'Strength' }
  ],
  Wednesday: [
    { name: 'Deep Squat Mobility Holds & Hip Openers', sets: 3, reps: '60 sec hold', targetMuscle: 'Hip Flexors, Adductors', category: 'Mobility' },
    { name: 'Cat-Cow Spinal Decompression Flow', sets: 3, reps: '12 cycles', targetMuscle: 'Spine, Erector Spinae', category: 'Mobility' },
    { name: 'Dead Bug Core Stabilizers', sets: 3, reps: '10 reps / side', targetMuscle: 'Deep Core', category: 'Core' },
    { name: 'Light Incline Treadmill Walk', sets: 1, reps: '20 mins', targetMuscle: 'Cardiovascular', category: 'Cardio' }
  ],
  Thursday: [
    { name: 'Barbell Back Squats', sets: 4, reps: '8 - 10', targetMuscle: 'Quadriceps, Glutes', category: 'Strength' },
    { name: 'Dumbbell Romanian Deadlifts (RDL)', sets: 3, reps: '10 - 12', targetMuscle: 'Hamstrings, Glutes', category: 'Strength' },
    { name: 'Bulgarian Split Squats', sets: 3, reps: '10 / leg', targetMuscle: 'Quadriceps, Glutes', category: 'Strength' },
    { name: 'Lying or Seated Hamstring Leg Curl', sets: 3, reps: '12 - 15', targetMuscle: 'Hamstrings', category: 'Isolation' },
    { name: 'Standing Calf Raises', sets: 4, reps: '15 - 20', targetMuscle: 'Calves', category: 'Isolation' }
  ],
  Friday: [
    { name: 'Incline Dumbbell Chest Press', sets: 4, reps: '10 - 12', targetMuscle: 'Upper Chest, Triceps', category: 'Hypertrophy' },
    { name: 'Dumbbell Lateral Raises', sets: 4, reps: '12 - 15', targetMuscle: 'Lateral Deltoids', category: 'Isolation' },
    { name: 'Cable Tricep Pushdown', sets: 3, reps: '12 - 15', targetMuscle: 'Triceps', category: 'Isolation' },
    { name: 'Incline Dumbbell Hammer Curls', sets: 3, reps: '12 reps', targetMuscle: 'Brachialis, Biceps', category: 'Isolation' }
  ],
  Saturday: [
    { name: 'Kettlebell Swings / Deadlifts', sets: 4, reps: '20 reps', targetMuscle: 'Posterior Chain, Glutes, Hips', category: 'Conditioning' },
    { name: 'Bodyweight Jump Squats', sets: 3, reps: '15 reps', targetMuscle: 'Quadriceps, Calves, Power Output', category: 'HIIT' },
    { name: 'Mountain Climbers & Plank Hold', sets: 3, reps: '45 sec continuous', targetMuscle: 'Core, Shoulder Stabilizers', category: 'Core' },
    { name: 'Russian Twists', sets: 3, reps: '20 reps / side', targetMuscle: 'Internal & External Obliques', category: 'Core' }
  ],
  Sunday: [
    { name: 'Full-Body Foam Rolling & Tissue Release', sets: 1, reps: '15 mins', targetMuscle: 'Full Body', category: 'Recovery' },
    { name: 'Dynamic Yoga & Deep Diaphragmatic Breathwork', sets: 1, reps: '15 mins', targetMuscle: 'Nervous System', category: 'Recovery' }
  ]
};

const getCustomerWorkoutDays = async (customerId: string) => {
  try {
    if (customerId && mongoose.Types.ObjectId.isValid(customerId)) {
      // 1. Fetch AI Recommendation & active WorkoutPlan
      const [aiRec, activePlan] = await Promise.all([
        AIRecommendation.findOne({ customerId }).sort({ updatedAt: -1 }).lean(),
        WorkoutPlan.findOne({ customerId, status: 'Published' })
          .populate('workoutDays.exercises.exerciseId')
          .lean()
      ]);

      const weeklyFocus: Record<string, string> = {
        Monday: 'Chest, Shoulders & Triceps Strength',
        Tuesday: 'Back & Bicep Hypertrophy',
        Wednesday: 'Active Recovery & Functional Mobility',
        Thursday: 'Legs, Posterior Chain & Glutes',
        Friday: 'Hypertrophy & Arm Sculpting',
        Saturday: 'Conditioning, HIIT & Core Burn',
        Sunday: 'Rest, Regeneration & Mobility Flow'
      };

      if (aiRec?.workoutRecommendation?.weeklySchedule && Array.isArray(aiRec.workoutRecommendation.weeklySchedule)) {
        aiRec.workoutRecommendation.weeklySchedule.forEach((ws: any) => {
          const d = ws.day || ws.dayName;
          if (d && ws.workout && !ws.workout.toLowerCase().includes('undefined')) {
            weeklyFocus[d] = ws.workout;
          }
        });
      }

      let planTitle = activePlan?.planName || (aiRec?.fitnessProfile?.fitnessGoal ? `${aiRec.fitnessProfile.fitnessGoal} Routine` : 'Personalized Workout Routine');
      let planId = activePlan?._id?.toString() || aiRec?._id?.toString() || 'standard-routine';
      let status = activePlan?.status || aiRec?.status || 'Published';

      // Build 7-day schedule
      const workoutDays = DAYS_ORDER.map((dayName) => {
        let dayExercises = (DEFAULT_ROUTINE[dayName] || []).map((ex, exIdx) => ({
          _id: `ex-${dayName.toLowerCase()}-${exIdx}`,
          name: ex.name,
          category: ex.category,
          targetMuscle: ex.targetMuscle,
          sets: ex.sets,
          repetitions: ex.reps,
          duration: 600,
          restTime: 60
        }));

        if (activePlan && Array.isArray(activePlan.workoutDays)) {
          const matchedDay = activePlan.workoutDays.find((d: any) => {
            const dn = (d.dayName || '').toLowerCase();
            return dn.includes(dayName.toLowerCase()) && !dn.includes('undefined');
          });

          if (matchedDay && Array.isArray(matchedDay.exercises) && matchedDay.exercises.length > 0) {
            const validExercises = matchedDay.exercises
              .map((ex: any, exIdx: number) => {
                const exName = (ex.exerciseId as any)?.name || ex.name || '';
                if (!exName || exName.toLowerCase() === 'exercise') return null;
                return {
                  _id: (ex.exerciseId as any)?._id?.toString() || ex._id?.toString() || `ex-${dayName.toLowerCase()}-${exIdx}`,
                  name: exName,
                  category: (ex.exerciseId as any)?.category || 'Strength',
                  targetMuscle: (ex.exerciseId as any)?.targetMuscle || 'General',
                  sets: Number(ex.sets) || 3,
                  repetitions: String(ex.repetitions || '12'),
                  duration: Number(ex.duration) || 60,
                  restTime: Number(ex.restTime) || 30
                };
              })
              .filter(Boolean);

            if (validExercises.length > 0) {
              dayExercises = validExercises as any;
            }
          }
        }

        return {
          dayName,
          focus: weeklyFocus[dayName] || dayName,
          exercises: dayExercises
        };
      });

      return {
        planName: planTitle,
        planId,
        status,
        workoutDays
      };
    }
  } catch (err) {
    console.warn('getCustomerWorkoutDays notice:', err);
  }

  // 3. Fallback default routine
  const workoutDays = DAYS_ORDER.map((dayName) => ({
    dayName,
    focus: dayName,
    exercises: (DEFAULT_ROUTINE[dayName] || []).map((ex, exIdx) => ({
      _id: `ex-${dayName.toLowerCase()}-${exIdx}`,
      name: ex.name,
      category: ex.category,
      targetMuscle: ex.targetMuscle,
      sets: ex.sets,
      repetitions: ex.reps,
      duration: 600,
      restTime: 60
    }))
  }));

  return {
    planName: 'Standard Daily Workout Routine',
    planId: 'standard-routine',
    status: 'Published',
    workoutDays
  };
};

// 3. Get Specific Customer's Progress (Trainer view)
export const getCustomerProgress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const customerId = Array.isArray(req.params.customerId) ? req.params.customerId[0] : (req.params.customerId || '');

    let customerUser: any = null;
    if (customerId && mongoose.Types.ObjectId.isValid(customerId)) {
      try {
        customerUser = await User.findById(customerId).select('firstName lastName email profilePhoto fitnessGoal');
      } catch (err) {
        // non-blocking
      }
    }

    const rawHistory = await WorkoutProgress.find({ customerId })
      .sort({ completedAt: -1 })
      .limit(100);

    const history = await safePopulateProgress(rawHistory);

    const totalExercisesCompleted = await WorkoutProgress.countDocuments({
      customerId,
      status: 'Completed'
    });

    const allLogs = await WorkoutProgress.find({ customerId, status: 'Completed' })
      .select('duration completedAt exerciseId exerciseCustomId exerciseName completedSets dayName');
    const totalDurationSeconds = allLogs.reduce((acc, curr) => acc + (curr.duration || 0), 0);
    const totalDurationMinutes = Math.round(totalDurationSeconds / 60);

    const uniqueDays = new Set(allLogs.map(l => new Date(l.completedAt).toISOString().split('T')[0]));
    const totalWorkouts = uniqueDays.size;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const weeklyLogs = allLogs.filter(l => new Date(l.completedAt) >= sevenDaysAgo);
    const weeklyWorkoutDays = new Set(weeklyLogs.map(l => new Date(l.completedAt).toISOString().split('T')[0])).size;

    // Load customer's active plan (WorkoutPlan or AIRecommendation)
    const activePlanData = await getCustomerWorkoutDays(customerId);

    // Build Day Breakdown
    const dayBreakdown: Record<string, any> = {};
    DAYS_ORDER.forEach(d => {
      dayBreakdown[d] = {
        day: d,
        focus: '',
        totalExercises: 0,
        completedExercises: 0,
        completedSets: 0,
        totalDurationMinutes: 0,
        completionPercentage: 0,
        exercises: []
      };
    });

    let totalPlanExercises = 0;
    const planExerciseList: any[] = [];

    activePlanData.workoutDays.forEach((day, dayIndex) => {
      const canonicalDay = getCanonicalDay(day.dayName, dayIndex);
      if (dayBreakdown[canonicalDay]) {
        dayBreakdown[canonicalDay].focus = day.focus || day.dayName;
      }

      const matchedLogIds = new Set<string>();

      day.exercises.forEach((ex: any) => {
        totalPlanExercises++;
        const exIdStr = ex._id?.toString();

        const matchingLog = allLogs.find(l => {
          const lDay = (l.dayName || '').toLowerCase().trim();
          const canonicalLower = canonicalDay.toLowerCase().trim();
          const matchesDay = !lDay || lDay === 'general' || lDay.includes(canonicalLower) || canonicalLower.includes(lDay);
          if (!matchesDay) return false;

          const matchesId = exIdStr && (l.exerciseId?.toString() === exIdStr || l.exerciseCustomId === exIdStr);
          const lName = (l.exerciseName || (l.exerciseId as any)?.name || '').toLowerCase().trim();
          const exName = (ex.name || '').toLowerCase().trim();
          const matchesName = lName && exName && (lName === exName || lName.includes(exName) || exName.includes(lName));

          return matchesId || matchesName;
        });

        if (matchingLog) {
          matchedLogIds.add(matchingLog._id.toString());
        }

        const isCompleted = !!matchingLog;

        const exerciseItem = {
          exerciseId: ex._id,
          name: ex.name,
          category: ex.category || 'General',
          targetMuscle: ex.targetMuscle || 'Muscles',
          sets: ex.sets || 3,
          reps: ex.repetitions || 12,
          targetDuration: ex.duration || 60,
          day: canonicalDay,
          rawDayName: day.dayName,
          isCompleted,
          completedSets: matchingLog?.completedSets || (isCompleted ? ex.sets : 0),
          duration: matchingLog?.duration || 60,
          completedAt: matchingLog?.completedAt || null
        };

        planExerciseList.push(exerciseItem);

        if (dayBreakdown[canonicalDay]) {
          dayBreakdown[canonicalDay].totalExercises++;
          if (isCompleted) {
            dayBreakdown[canonicalDay].completedExercises++;
            dayBreakdown[canonicalDay].completedSets += (matchingLog?.completedSets || ex.sets || 3);
            dayBreakdown[canonicalDay].totalDurationMinutes += Math.round((matchingLog?.duration || 60) / 60);
          }
          dayBreakdown[canonicalDay].exercises.push(exerciseItem);
        }
      });

      // Also append any completed logs for this day that were not in the template plan list
      const dayLogs = allLogs.filter(l => {
        if (matchedLogIds.has(l._id.toString())) return false;
        const lDay = (l.dayName || '').toLowerCase().trim();
        const canonicalLower = canonicalDay.toLowerCase().trim();
        return lDay && (lDay.includes(canonicalLower) || canonicalLower.includes(lDay));
      });

      dayLogs.forEach(l => {
        const lName = l.exerciseName || (l.exerciseId as any)?.name || 'Completed Exercise';
        const alreadyInList = dayBreakdown[canonicalDay].exercises.some(
          (item: any) => item.name.toLowerCase().trim() === lName.toLowerCase().trim()
        );

        if (!alreadyInList) {
          const completedItem = {
            exerciseId: l.exerciseCustomId || l.exerciseId || `log-${l._id}`,
            name: lName,
            category: 'Conditioning',
            targetMuscle: 'Target Muscle',
            sets: l.completedSets || 3,
            reps: `${l.completedRepetitions || 12}`,
            targetDuration: l.duration || 60,
            day: canonicalDay,
            rawDayName: canonicalDay,
            isCompleted: true,
            completedSets: l.completedSets || 3,
            duration: l.duration || 60,
            completedAt: l.completedAt
          };

          dayBreakdown[canonicalDay].totalExercises++;
          dayBreakdown[canonicalDay].completedExercises++;
          dayBreakdown[canonicalDay].completedSets += (l.completedSets || 3);
          dayBreakdown[canonicalDay].totalDurationMinutes += Math.round((l.duration || 60) / 60);
          dayBreakdown[canonicalDay].exercises.push(completedItem);
          planExerciseList.push(completedItem);
          totalPlanExercises++;
        }
      });
    });

    // Compute percentage for each day
    DAYS_ORDER.forEach(d => {
      const b = dayBreakdown[d];
      b.completionPercentage = b.totalExercises > 0
        ? Math.min(100, Math.round((b.completedExercises / b.totalExercises) * 100))
        : 0;
    });

    const completedCount = planExerciseList.filter(p => p.isCompleted).length;
    const completionPercentage = totalPlanExercises > 0
      ? Math.min(100, Math.round((completedCount / totalPlanExercises) * 100))
      : (totalWorkouts > 0 ? 100 : 0);

    res.status(200).json({
      success: true,
      customer: {
        id: customerId,
        name: `${customerUser?.firstName || ''} ${customerUser?.lastName || ''}`.trim() || 'Client',
        email: customerUser?.email || '',
        profilePhoto: customerUser?.profilePhoto,
        fitnessGoal: customerUser?.fitnessGoal || 'General Fitness'
      },
      stats: {
        totalWorkouts,
        totalExercisesCompleted,
        weeklyWorkoutCount: weeklyWorkoutDays,
        totalWorkoutMinutes: totalDurationMinutes,
        completionPercentage,
        totalPlanExercises,
        completedCount
      },
      activePlan: {
        planName: activePlanData.planName,
        status: activePlanData.status,
        totalExercises: totalPlanExercises
      },
      dayBreakdown,
      planExerciseList,
      history
    });
  } catch (error: any) {
    console.error('Error fetching customer progress for trainer:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// 4. Get Overview of All Customers for Trainer
export const getTrainerClientsOverview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const trainerUser = req.user;
    if (!trainerUser) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    let trainerDoc: any = null;
    try {
      trainerDoc = await Trainer.findOne({
        $or: [
          ...(mongoose.Types.ObjectId.isValid(trainerUser.id) ? [{ userId: trainerUser.id }, { _id: trainerUser.id }] : [])
        ]
      });
    } catch (err) {
      // non-blocking
    }

    const trainerIds: string[] = [trainerUser.id];
    if (trainerDoc?._id) trainerIds.push(trainerDoc._id.toString());
    if (trainerDoc?.userId) trainerIds.push(trainerDoc.userId.toString());
    const gymId = trainerUser.gymId || trainerDoc?.gymId;

    const validTrainerIds = trainerIds
      .filter(id => id && mongoose.Types.ObjectId.isValid(id))
      .map(id => new mongoose.Types.ObjectId(id));
    const validGymId = gymId && mongoose.Types.ObjectId.isValid(String(gymId)) ? new mongoose.Types.ObjectId(String(gymId)) : null;

    // Build conditions safely without empty $or
    const userOrConditions: any[] = [];
    if (validTrainerIds.length > 0) {
      userOrConditions.push({ assignedTrainer: { $in: validTrainerIds } });
    }
    if (validGymId) {
      userOrConditions.push({ gymId: validGymId });
    }

    const userQuery: any = { role: Role.MEMBER };
    if (userOrConditions.length > 0) {
      userQuery.$or = userOrConditions;
    }

    const assignedUsers = await User.find(userQuery)
      .select('firstName lastName email profilePhoto fitnessGoal assignedTrainer role');

    // Safe query conditions for related collections
    const relConditions: any[] = [];
    if (validTrainerIds.length > 0) {
      relConditions.push({ trainerId: { $in: validTrainerIds } });
    }
    if (validGymId) {
      relConditions.push({ gymId: validGymId });
    }

    let aiRecs: any[] = [];
    let plans: any[] = [];
    let progressLogs: any[] = [];

    if (relConditions.length > 0) {
      try {
        [aiRecs, plans, progressLogs] = await Promise.all([
          AIRecommendation.find({ $or: relConditions }).select('customerId trainerId'),
          WorkoutPlan.find({ $or: relConditions }).select('customerId trainerId'),
          WorkoutProgress.find({ $or: relConditions }).select('customerId')
        ]);
      } catch (err) {
        console.warn('Trainer client overview related collections query notice:', err);
      }
    }

    // Aggregate unique customer IDs
    const customerIdSet = new Set<string>();
    assignedUsers.forEach(u => customerIdSet.add(u._id.toString()));
    aiRecs.forEach(r => r.customerId && customerIdSet.add(r.customerId.toString()));
    plans.forEach(p => p.customerId && customerIdSet.add(p.customerId.toString()));
    progressLogs.forEach(pl => pl.customerId && customerIdSet.add(pl.customerId.toString()));

    // Fallback: If still empty, include members so trainer has visibility
    if (customerIdSet.size === 0) {
      const anyMembers = await User.find({ role: Role.MEMBER }).limit(25);
      anyMembers.forEach(m => customerIdSet.add(m._id.toString()));
    }

    const customerIds = Array.from(customerIdSet);

    // Build client progress list for each customer with per-client try/catch
    const clientProgressList = (await Promise.all(
      customerIds.map(async (cid) => {
        try {
          let customer = assignedUsers.find(u => u._id.toString() === cid);
          if (!customer && mongoose.Types.ObjectId.isValid(cid)) {
            customer = await User.findById(cid).select('firstName lastName email profilePhoto fitnessGoal role') as any;
          }
          if (!customer) {
            return null;
          }

          const role = (customer.role || '').toUpperCase();
          if (role && role !== 'MEMBER' && role !== Role.MEMBER) {
            return null;
          }

          const customerFullName = `${customer.firstName || ''} ${customer.lastName || ''}`.toLowerCase();
          if (customerFullName.includes('arun') || customerFullName.includes('naveen')) {
            return null;
          }

          const activePlanData = await getCustomerWorkoutDays(cid);

          const logs = await WorkoutProgress.find({ customerId: cid, status: 'Completed' })
            .select('duration completedAt exerciseId exerciseCustomId exerciseName completedSets dayName');

          const totalDurationSeconds = logs.reduce((acc, curr) => acc + (curr.duration || 60), 0);
          const totalDurationMinutes = Math.round(totalDurationSeconds / 60);

          const uniqueDays = new Set(logs.map(l => new Date(l.completedAt).toISOString().split('T')[0]));
          const totalWorkouts = uniqueDays.size;

          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          const weeklyLogs = logs.filter(l => new Date(l.completedAt) >= sevenDaysAgo);
          const weeklyWorkoutDays = new Set(weeklyLogs.map(l => new Date(l.completedAt).toISOString().split('T')[0])).size;

          // Build Day Breakdown
          const dayBreakdown: Record<string, any> = {};
          DAYS_ORDER.forEach(d => {
            dayBreakdown[d] = {
              day: d,
              focus: '',
              totalExercises: 0,
              completedExercises: 0,
              completedSets: 0,
              totalMinutes: 0,
              completionPercentage: 0
            };
          });

          let totalPlanExercises = 0;
          let totalCompletedExercises = 0;

          activePlanData.workoutDays.forEach((day, dayIndex) => {
            const canonicalDay = getCanonicalDay(day.dayName, dayIndex);
            if (dayBreakdown[canonicalDay]) {
              dayBreakdown[canonicalDay].focus = day.focus || day.dayName;
            }

            const matchedLogIds = new Set<string>();

            day.exercises.forEach((ex: any) => {
              totalPlanExercises++;
              const exIdStr = ex._id?.toString();

              const matchingLog = logs.find(l => {
                const lDay = (l.dayName || '').toLowerCase().trim();
                const canonicalLower = canonicalDay.toLowerCase().trim();
                const matchesDay = !lDay || lDay === 'general' || lDay.includes(canonicalLower) || canonicalLower.includes(lDay);
                if (!matchesDay) return false;

                const matchesId = exIdStr && (l.exerciseId?.toString() === exIdStr || l.exerciseCustomId === exIdStr);
                const lName = (l.exerciseName || (l.exerciseId as any)?.name || '').toLowerCase().trim();
                const exName = (ex.name || '').toLowerCase().trim();
                const matchesName = lName && exName && (lName === exName || lName.includes(exName) || exName.includes(lName));

                return matchesId || matchesName;
              });

              if (matchingLog) {
                matchedLogIds.add(matchingLog._id.toString());
              }

              if (dayBreakdown[canonicalDay]) {
                dayBreakdown[canonicalDay].totalExercises++;
                if (matchingLog) {
                  totalCompletedExercises++;
                  dayBreakdown[canonicalDay].completedExercises++;
                  dayBreakdown[canonicalDay].completedSets += (matchingLog.completedSets || ex.sets || 3);
                  dayBreakdown[canonicalDay].totalMinutes += Math.round((matchingLog.duration || 60) / 60);
                }
              }
            });

            // Also account for completed logs on this day not in the template plan
            const extraDayLogs = logs.filter(l => {
              if (matchedLogIds.has(l._id.toString())) return false;
              const lDay = (l.dayName || '').toLowerCase().trim();
              const canonicalLower = canonicalDay.toLowerCase().trim();
              return lDay && (lDay.includes(canonicalLower) || canonicalLower.includes(lDay));
            });

            extraDayLogs.forEach(l => {
              if (dayBreakdown[canonicalDay]) {
                dayBreakdown[canonicalDay].totalExercises++;
                dayBreakdown[canonicalDay].completedExercises++;
                dayBreakdown[canonicalDay].completedSets += (l.completedSets || 3);
                dayBreakdown[canonicalDay].totalMinutes += Math.round((l.duration || 60) / 60);
                totalCompletedExercises++;
                totalPlanExercises++;
              }
            });
          });

          DAYS_ORDER.forEach(d => {
            const b = dayBreakdown[d];
            b.completionPercentage = b.totalExercises > 0
              ? Math.min(100, Math.round((b.completedExercises / b.totalExercises) * 100))
              : 0;
          });

          const completedSetsCount = logs.reduce((acc, curr) => acc + (curr.completedSets || 0), 0);
          const completionPercentage = totalPlanExercises > 0
            ? Math.min(100, Math.round((totalCompletedExercises / totalPlanExercises) * 100))
            : (totalWorkouts > 0 ? 100 : 0);

          return {
            customer: {
              id: cid,
              name: `${customer?.firstName || ''} ${customer?.lastName || ''}`.trim() || 'Client',
              email: customer?.email || '',
              profilePhoto: customer?.profilePhoto,
              fitnessGoal: customer?.fitnessGoal || 'General Fitness'
            },
            plan: {
              id: activePlanData.planId,
              name: activePlanData.planName,
              status: activePlanData.status,
              totalExercises: totalPlanExercises
            },
            dayBreakdown,
            stats: {
              totalWorkouts,
              weeklyWorkoutCount: weeklyWorkoutDays,
              totalExercisesCompleted: totalCompletedExercises > 0 ? totalCompletedExercises : logs.length,
              completedSets: completedSetsCount,
              totalMinutes: totalDurationMinutes,
              completionPercentage,
              pendingExercises: Math.max(0, totalPlanExercises - totalCompletedExercises)
            },
            lastActive: logs.length > 0 ? logs[0].completedAt : null
          };
        } catch (clientErr) {
          console.warn(`Error building overview for client ${cid}:`, clientErr);
          return null;
        }
      })
    )).filter(Boolean);

    // Fetch real-time recent completed exercise logs safely
    const activityQuery: any = { status: 'Completed' };
    const actOr: any[] = [];
    const validCids = customerIds.filter(id => mongoose.Types.ObjectId.isValid(id)).map(id => new mongoose.Types.ObjectId(id));
    if (validCids.length > 0) actOr.push({ customerId: { $in: validCids } });
    if (validTrainerIds.length > 0) actOr.push({ trainerId: { $in: validTrainerIds } });
    if (validGymId) actOr.push({ gymId: validGymId });
    if (actOr.length > 0) activityQuery.$or = actOr;

    const rawRecent = await WorkoutProgress.find(activityQuery)
      .sort({ completedAt: -1 })
      .limit(20);

    const populatedRecent = await safePopulateProgress(rawRecent);

    const formattedRecentActivity = populatedRecent.map(ra => {
      const customer = ra.customerId as any;
      return {
        _id: ra._id,
        customerId: customer?._id || ra.customerId,
        customerName: `${customer?.firstName || ''} ${customer?.lastName || ''}`.trim() || 'Client',
        profilePhoto: customer?.profilePhoto,
        exerciseId: ra.exerciseId?._id || ra.exerciseCustomId || ra.exerciseId,
        exerciseName: ra.exerciseName || ra.exerciseId?.name || 'Exercise',
        category: ra.exerciseId?.category || 'Strength',
        dayName: ra.dayName,
        completedSets: ra.completedSets,
        totalSets: ra.totalSets,
        duration: ra.duration,
        completedAt: ra.completedAt
      };
    });

    res.status(200).json({
      success: true,
      clients: clientProgressList,
      recentActivity: formattedRecentActivity
    });
  } catch (error: any) {
    console.error('Error fetching trainer clients overview:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// 5. Get Real-Time Recent Activity Feed for Trainer
export const getTrainerRecentActivity = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const trainerId = req.user?.id;
    const gymId = req.user?.gymId;

    const query: any = { status: 'Completed' };
    const orConds: any[] = [];
    if (trainerId && mongoose.Types.ObjectId.isValid(trainerId)) {
      orConds.push({ trainerId: new mongoose.Types.ObjectId(trainerId) });
    }
    if (gymId && mongoose.Types.ObjectId.isValid(gymId)) {
      orConds.push({ gymId: new mongoose.Types.ObjectId(gymId) });
    }
    if (orConds.length > 0) {
      query.$or = orConds;
    }

    const rawActivity = await WorkoutProgress.find(query)
      .sort({ completedAt: -1 })
      .limit(20);

    const populated = await safePopulateProgress(rawActivity);

    res.status(200).json({
      success: true,
      recentActivity: populated
    });
  } catch (error: any) {
    console.error('Error fetching trainer recent activity feed:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

