import { Response } from 'express';
import WorkoutPlan from '../models/WorkoutPlan';
import Exercise from '../models/Exercise';
import AIRecommendation from '../models/AIRecommendation';
import User from '../models/User';
import Gym from '../models/Gym';
import { AuthRequest } from '../middlewares/auth';
import mongoose from 'mongoose';

const resolveGymId = async (req: AuthRequest): Promise<string | undefined> => {
  if (req.user?.gymId) return req.user.gymId.toString();
  if (req.query.gymId) return req.query.gymId as string;
  const gym = await Gym.findOne().sort({ createdAt: -1 });
  return gym?._id?.toString();
};

// 1. Get Customer's Published Workout Plan (Customer view)
export const getMyPublishedPlan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const plan = await WorkoutPlan.findOne({
      customerId: user.id,
      status: 'Published'
    })
      .populate({
        path: 'workoutDays.exercises.exerciseId',
        model: 'Exercise'
      })
      .populate('trainerId', 'firstName lastName name email mobile profilePhoto')
      .sort({ updatedAt: -1 });

    if (!plan) {
      res.status(200).json({ success: true, plan: null, message: 'No published workout plan assigned yet' });
      return;
    }

    res.status(200).json({ success: true, plan });
  } catch (error: any) {
    console.error('Error fetching member workout plan:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// 2. Get All Plans for a Customer (Trainer view)
export const getCustomerWorkoutPlans = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { customerId } = req.params;
    const plans = await WorkoutPlan.find({ customerId })
      .populate({
        path: 'workoutDays.exercises.exerciseId',
        model: 'Exercise'
      })
      .populate('trainerId', 'firstName lastName name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, plans });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// 3. Get Trainer's Created Workout Plans
export const getTrainerWorkoutPlans = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const trainerId = req.user?.id;
    const gymId = (await resolveGymId(req)) || req.user?.gymId;

    const query: any = {};
    if (req.user?.role === 'TRAINER') {
      query.trainerId = trainerId;
    } else if (gymId) {
      query.gymId = gymId;
    }

    const plans = await WorkoutPlan.find(query)
      .populate('customerId', 'firstName lastName name email mobile')
      .populate('trainerId', 'firstName lastName name email')
      .populate({
        path: 'workoutDays.exercises.exerciseId',
        model: 'Exercise'
      })
      .sort({ updatedAt: -1 });

    res.status(200).json({ success: true, plans });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// 4. Get Single Workout Plan by ID
export const getWorkoutPlanById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const plan = await WorkoutPlan.findById(id)
      .populate({
        path: 'workoutDays.exercises.exerciseId',
        model: 'Exercise'
      })
      .populate('customerId', 'firstName lastName name email mobile')
      .populate('trainerId', 'firstName lastName name email');

    if (!plan) {
      res.status(404).json({ success: false, message: 'Workout plan not found' });
      return;
    }

    res.status(200).json({ success: true, plan });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// 5. Create Workout Plan (Trainer)
export const createWorkoutPlan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user || !['TRAINER', 'GYM_OWNER', 'ADMIN'].includes(user.role)) {
      res.status(403).json({ success: false, message: 'Only trainers or gym staff can create workout plans' });
      return;
    }

    const gymId = (await resolveGymId(req)) || user.gymId;
    if (!gymId) {
      res.status(400).json({ success: false, message: 'Gym context required' });
      return;
    }

    const {
      customerId,
      planName,
      description,
      workoutDays,
      status,
      aiRecommendationId
    } = req.body;

    if (!customerId || !planName) {
      res.status(400).json({ success: false, message: 'Customer ID and Plan Name are required' });
      return;
    }

    const customer = await User.findById(customerId);
    if (!customer) {
      res.status(404).json({ success: false, message: 'Customer not found' });
      return;
    }

    // If publishing immediately, unpublish previous published plans for this customer
    if (status === 'Published') {
      await WorkoutPlan.updateMany(
        { customerId, status: 'Published' },
        { $set: { status: 'Archived' } }
      );
    }

    const plan = new WorkoutPlan({
      customerId,
      trainerId: user.id,
      gymId,
      planName,
      description: description || '',
      workoutDays: workoutDays || [],
      status: status || 'Draft',
      aiRecommendationId: aiRecommendationId || undefined,
      publishedAt: status === 'Published' ? new Date() : undefined
    });

    await plan.save();

    // Populate exercises for return
    const populated = await WorkoutPlan.findById(plan._id)
      .populate({
        path: 'workoutDays.exercises.exerciseId',
        model: 'Exercise'
      })
      .populate('customerId', 'firstName lastName name email');

    res.status(201).json({ success: true, message: 'Workout plan created successfully', plan: populated });
  } catch (error: any) {
    console.error('Error creating workout plan:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// 6. Update Workout Plan (Trainer)
export const updateWorkoutPlan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user || !['TRAINER', 'GYM_OWNER', 'ADMIN'].includes(user.role)) {
      res.status(403).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const plan = await WorkoutPlan.findById(id);
    if (!plan) {
      res.status(404).json({ success: false, message: 'Workout plan not found' });
      return;
    }

    const {
      planName,
      description,
      workoutDays,
      status
    } = req.body;

    if (planName) plan.planName = planName;
    if (description !== undefined) plan.description = description;
    if (workoutDays !== undefined) plan.workoutDays = workoutDays;
    
    if (status) {
      if (status === 'Published' && plan.status !== 'Published') {
        // Archive previous published plans for this customer
        await WorkoutPlan.updateMany(
          { customerId: plan.customerId, _id: { $ne: plan._id }, status: 'Published' },
          { $set: { status: 'Archived' } }
        );
        plan.publishedAt = new Date();
      }
      plan.status = status;
    }

    await plan.save();

    const populated = await WorkoutPlan.findById(plan._id)
      .populate({
        path: 'workoutDays.exercises.exerciseId',
        model: 'Exercise'
      })
      .populate('customerId', 'firstName lastName name email');

    res.status(200).json({ success: true, message: 'Workout plan updated successfully', plan: populated });
  } catch (error: any) {
    console.error('Error updating workout plan:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// 7. Publish Workout Plan
export const publishWorkoutPlan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const plan = await WorkoutPlan.findById(id);
    if (!plan) {
      res.status(404).json({ success: false, message: 'Workout plan not found' });
      return;
    }

    // Archive previous published plans for this customer
    await WorkoutPlan.updateMany(
      { customerId: plan.customerId, _id: { $ne: plan._id }, status: 'Published' },
      { $set: { status: 'Archived' } }
    );

    plan.status = 'Published';
    plan.publishedAt = new Date();
    await plan.save();

    res.status(200).json({ success: true, message: 'Workout plan published to client successfully', plan });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// 8. Delete Workout Plan
export const deleteWorkoutPlan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const plan = await WorkoutPlan.findByIdAndDelete(id);
    if (!plan) {
      res.status(404).json({ success: false, message: 'Workout plan not found' });
      return;
    }
    res.status(200).json({ success: true, message: 'Workout plan deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// 9. Build Draft Workout Plan from AI Recommendation (AI Workflow Integration)
export const buildPlanFromAI = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { aiRecommendationId } = req.body;
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const aiRec = await AIRecommendation.findById(aiRecommendationId);
    if (!aiRec) {
      res.status(404).json({ success: false, message: 'AI Recommendation not found' });
      return;
    }

    const gymId = aiRec.gymId || user.gymId || (await resolveGymId(req));
    const customerId = aiRec.customerId;

    // Fetch existing exercises from gym library to map matching exercises
    const gymExercises = await Exercise.find({ gymId, status: 'Active' });

    // Map AI weekly schedule / exercises to structured workout days
    const workoutDays: any[] = [];

    if (aiRec.workoutRecommendation?.weeklySchedule && aiRec.workoutRecommendation.weeklySchedule.length > 0) {
      for (const scheduleItem of aiRec.workoutRecommendation.weeklySchedule) {
        // Find matching exercises for this day focus
        const dayExercises: any[] = [];
        const aiExercises = aiRec.workoutRecommendation?.exercises || [];

        aiExercises.forEach((aiEx, idx) => {
          // Look for closest match in library
          const matched = gymExercises.find(ge => 
            ge.name.toLowerCase().includes(aiEx.name.toLowerCase()) || 
            aiEx.name.toLowerCase().includes(ge.name.toLowerCase()) ||
            ge.targetMuscle.toLowerCase().includes((aiEx.targetMuscleGroup || '').toLowerCase())
          ) || gymExercises[idx % gymExercises.length];

          if (matched) {
            dayExercises.push({
              exerciseId: matched._id,
              order: dayExercises.length + 1,
              sets: Number(aiEx.sets) || matched.defaultSets || 3,
              repetitions: parseInt(aiEx.reps) || matched.defaultRepetitions || 12,
              duration: matched.defaultDuration || 60,
              restTime: parseInt(aiEx.rest) || matched.defaultRest || 30,
              trainerNotes: `Recommended by AI for ${aiRec.fitnessProfile?.fitnessGoal || 'optimal fitness'}. Maintain proper form.`
            });
          }
        });

        workoutDays.push({
          dayName: `${scheduleItem.day} – ${scheduleItem.workout || 'Full Body'}`,
          focus: scheduleItem.workout || 'General',
          exercises: dayExercises.slice(0, 5) // 4-5 focused exercises per day
        });
      }
    } else {
      // Create a default Day 1 – Full Body with first 4-5 exercises
      const dayExercises = gymExercises.slice(0, 5).map((ge, idx) => ({
        exerciseId: ge._id,
        order: idx + 1,
        sets: ge.defaultSets || 3,
        repetitions: ge.defaultRepetitions || 12,
        duration: ge.defaultDuration || 60,
        restTime: ge.defaultRest || 30,
        trainerNotes: 'Focus on full range of motion and steady breathing.'
      }));

      workoutDays.push({
        dayName: 'Day 1 – Full Body Workout',
        focus: 'Strength & Conditioning',
        exercises: dayExercises
      });
    }

    const draftPlan = new WorkoutPlan({
      customerId,
      trainerId: user.id,
      gymId,
      planName: `${aiRec.fitnessProfile?.fitnessGoal || 'Personalized'} Transformation Routine`,
      description: `Custom workout plan based on AI assessment for ${aiRec.fitnessProfile?.fitnessGoal || 'fitness progress'}.`,
      status: 'Draft',
      workoutDays,
      aiRecommendationId: aiRec._id
    });

    await draftPlan.save();

    const populated = await WorkoutPlan.findById(draftPlan._id)
      .populate({
        path: 'workoutDays.exercises.exerciseId',
        model: 'Exercise'
      })
      .populate('customerId', 'firstName lastName name email');

    res.status(201).json({
      success: true,
      message: 'Draft workout plan created from AI recommendation! You can now adjust exercises and publish to client.',
      plan: populated
    });
  } catch (error: any) {
    console.error('Error generating workout plan from AI:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
