import { Response } from 'express';
import WorkoutProgress from '../models/WorkoutProgress';
import WorkoutPlan from '../models/WorkoutPlan';
import Exercise from '../models/Exercise';
import { AuthRequest } from '../middlewares/auth';
import mongoose from 'mongoose';

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
      dayName,
      completedSets,
      totalSets,
      completedRepetitions,
      targetRepetitions,
      duration,
      status,
      notes
    } = req.body;

    if (!workoutPlanId || !exerciseId) {
      res.status(400).json({ success: false, message: 'Workout Plan ID and Exercise ID are required' });
      return;
    }

    const plan = await WorkoutPlan.findById(workoutPlanId);
    const exercise = await Exercise.findById(exerciseId);

    const progress = new WorkoutProgress({
      customerId: user.id,
      workoutPlanId,
      exerciseId,
      gymId: plan?.gymId || user.gymId,
      trainerId: plan?.trainerId,
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

    const history = await WorkoutProgress.find({ customerId })
      .populate('exerciseId', 'name category targetMuscle difficulty thumbnailUrl videoUrl')
      .populate('workoutPlanId', 'planName')
      .sort({ completedAt: -1 })
      .limit(50);

    // Calculate aggregated statistics
    const totalExercisesCompleted = await WorkoutProgress.countDocuments({
      customerId,
      status: 'Completed'
    });

    // Total workout time in seconds
    const allLogs = await WorkoutProgress.find({ customerId, status: 'Completed' }).select('duration completedAt');
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

    // Active published plan completion %
    const activePlan = await WorkoutPlan.findOne({ customerId, status: 'Published' });
    let totalPlanExercises = 0;
    if (activePlan) {
      activePlan.workoutDays.forEach(day => {
        totalPlanExercises += day.exercises.length;
      });
    }

    // Unique exercises completed in the current cycle
    const completedPlanExerciseIds = new Set(
      allLogs.map(l => (l as any).exerciseId?.toString())
    );
    const completionPercentage = totalPlanExercises > 0
      ? Math.min(100, Math.round((completedPlanExerciseIds.size / totalPlanExercises) * 100))
      : (totalWorkouts > 0 ? 100 : 0);

    res.status(200).json({
      success: true,
      stats: {
        totalWorkouts,
        totalExercisesCompleted,
        weeklyWorkoutCount: weeklyWorkoutDays,
        workoutStreak: streak,
        totalWorkoutMinutes: totalDurationMinutes,
        completionPercentage,
        totalPlanExercises
      },
      history
    });
  } catch (error: any) {
    console.error('Error fetching member progress:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// 3. Get Specific Customer's Progress (Trainer view)
export const getCustomerProgress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { customerId } = req.params;

    const history = await WorkoutProgress.find({ customerId })
      .populate('exerciseId', 'name category targetMuscle difficulty')
      .populate('workoutPlanId', 'planName')
      .sort({ completedAt: -1 })
      .limit(100);

    const totalExercisesCompleted = await WorkoutProgress.countDocuments({
      customerId,
      status: 'Completed'
    });

    const allLogs = await WorkoutProgress.find({ customerId, status: 'Completed' }).select('duration completedAt exerciseId');
    const totalDurationSeconds = allLogs.reduce((acc, curr) => acc + (curr.duration || 0), 0);
    const totalDurationMinutes = Math.round(totalDurationSeconds / 60);

    const uniqueDays = new Set(allLogs.map(l => new Date(l.completedAt).toISOString().split('T')[0]));
    const totalWorkouts = uniqueDays.size;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const weeklyLogs = allLogs.filter(l => new Date(l.completedAt) >= sevenDaysAgo);
    const weeklyWorkoutDays = new Set(weeklyLogs.map(l => new Date(l.completedAt).toISOString().split('T')[0])).size;

    // Active plan
    const activePlan = await WorkoutPlan.findOne({ customerId, status: 'Published' })
      .populate('workoutDays.exercises.exerciseId', 'name category targetMuscle');
    const completedIds = new Set(allLogs.map(l => l.exerciseId?.toString()));

    let totalPlanExercises = 0;
    const planExerciseList: any[] = [];
    if (activePlan) {
      activePlan.workoutDays.forEach(day => {
        day.exercises.forEach(ex => {
          totalPlanExercises++;
          const exIdStr = ex.exerciseId?._id?.toString() || (ex.exerciseId as any)?.toString();
          planExerciseList.push({
            exerciseId: ex.exerciseId?._id,
            name: (ex.exerciseId as any)?.name || 'Exercise',
            sets: ex.sets,
            reps: ex.repetitions,
            day: day.dayName,
            isCompleted: completedIds.has(exIdStr)
          });
        });
      });
    }

    const completionPercentage = totalPlanExercises > 0
      ? Math.min(100, Math.round((completedIds.size / totalPlanExercises) * 100))
      : (totalWorkouts > 0 ? 100 : 0);

    res.status(200).json({
      success: true,
      stats: {
        totalWorkouts,
        totalExercisesCompleted,
        weeklyWorkoutCount: weeklyWorkoutDays,
        totalWorkoutMinutes: totalDurationMinutes,
        completionPercentage,
        totalPlanExercises,
        completedCount: completedIds.size
      },
      activePlan,
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
    const trainerId = req.user?.id;
    const gymId = req.user?.gymId;

    // Find all workout plans created by this trainer or in this gym
    const query: any = {};
    if (trainerId) query.trainerId = trainerId;
    if (gymId && !query.trainerId) query.gymId = gymId;

    const plans = await WorkoutPlan.find(query)
      .populate('customerId', 'firstName lastName email profilePhoto fitnessGoal')
      .populate('workoutDays.exercises.exerciseId', 'name category targetMuscle')
      .sort({ updatedAt: -1 });

    const customerIds = Array.from(new Set(plans.map(p => (p.customerId as any)?._id?.toString()).filter(Boolean)));

    // For each customer, get completion count and stats
    const clientProgressList = await Promise.all(
      customerIds.map(async (cid) => {
        const customerPlan = plans.find(p => (p.customerId as any)?._id?.toString() === cid);
        const customer = (customerPlan?.customerId as any);

        const logs = await WorkoutProgress.find({ customerId: cid, status: 'Completed' }).select('duration completedAt exerciseId completedSets');
        const totalDurationSeconds = logs.reduce((acc, curr) => acc + (curr.duration || 0), 0);
        const totalDurationMinutes = Math.round(totalDurationSeconds / 60);

        const uniqueDays = new Set(logs.map(l => new Date(l.completedAt).toISOString().split('T')[0]));
        const totalWorkouts = uniqueDays.size;

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const weeklyLogs = logs.filter(l => new Date(l.completedAt) >= sevenDaysAgo);
        const weeklyWorkoutDays = new Set(weeklyLogs.map(l => new Date(l.completedAt).toISOString().split('T')[0])).size;

        let totalPlanExercises = 0;
        if (customerPlan) {
          customerPlan.workoutDays.forEach(day => {
            totalPlanExercises += day.exercises.length;
          });
        }

        const completedExerciseIds = new Set(logs.map(l => l.exerciseId?.toString()));
        const completedSetsCount = logs.reduce((acc, curr) => acc + (curr.completedSets || 0), 0);

        const completionPercentage = totalPlanExercises > 0
          ? Math.min(100, Math.round((completedExerciseIds.size / totalPlanExercises) * 100))
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
            id: customerPlan?._id,
            name: customerPlan?.planName,
            status: customerPlan?.status,
            totalExercises: totalPlanExercises
          },
          stats: {
            totalWorkouts,
            weeklyWorkoutCount: weeklyWorkoutDays,
            totalExercisesCompleted: logs.length,
            completedSets: completedSetsCount,
            totalMinutes: totalDurationMinutes,
            completionPercentage,
            pendingExercises: Math.max(0, totalPlanExercises - completedExerciseIds.size)
          },
          lastActive: logs.length > 0 ? logs[logs.length - 1].completedAt : null
        };
      })
    );

    // Fetch real-time recent completed exercise logs for this trainer/clients
    const recentQuery: any = { status: 'Completed' };
    if (trainerId && customerIds.length > 0) {
      recentQuery.$or = [{ trainerId }, { customerId: { $in: customerIds } }];
    } else if (trainerId) {
      recentQuery.trainerId = trainerId;
    } else if (gymId) {
      recentQuery.gymId = gymId;
    }

    const recentActivity = await WorkoutProgress.find(recentQuery)
      .populate('customerId', 'firstName lastName email profilePhoto')
      .populate('exerciseId', 'name category targetMuscle difficulty')
      .populate('workoutPlanId', 'planName')
      .sort({ completedAt: -1 })
      .limit(20);

    res.status(200).json({
      success: true,
      clients: clientProgressList,
      recentActivity
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
    if (trainerId) {
      query.$or = [{ trainerId }, { gymId }];
    } else if (gymId) {
      query.gymId = gymId;
    }

    const recentActivity = await WorkoutProgress.find(query)
      .populate('customerId', 'firstName lastName email profilePhoto')
      .populate('exerciseId', 'name category targetMuscle difficulty')
      .populate('workoutPlanId', 'planName')
      .sort({ completedAt: -1 })
      .limit(20);

    res.status(200).json({
      success: true,
      recentActivity
    });
  } catch (error: any) {
    console.error('Error fetching trainer recent activity feed:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

