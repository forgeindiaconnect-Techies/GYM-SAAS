import { Response } from 'express';
import TrainerPlanRequest from '../models/TrainerPlanRequest';
import WorkoutPlan from '../models/WorkoutPlan';
import WorkoutVideo from '../models/WorkoutVideo';
import Exercise from '../models/Exercise';
import User from '../models/User';
import Trainer from '../models/Trainer';
import Notification from '../models/Notification';
import DirectMessage from '../models/DirectMessage';
import Gym from '../models/Gym';
import { AuthRequest } from '../middlewares/auth';
import mongoose from 'mongoose';

// Helper to resolve Trainer User ID (whether passed a Trainer profile ID or User ID)
const resolveTrainerUserId = async (trainerIdOrUserId: string): Promise<mongoose.Types.ObjectId | null> => {
  if (!mongoose.Types.ObjectId.isValid(trainerIdOrUserId)) return null;

  // 1. Check if it's already a User document with role TRAINER or GYM_OWNER
  const user = await User.findById(trainerIdOrUserId);
  if (user && (user.role === 'TRAINER' || user.role === 'GYM_OWNER')) {
    return user._id as mongoose.Types.ObjectId;
  }

  // 2. Check if it's a Trainer document
  const trainer = await Trainer.findById(trainerIdOrUserId);
  if (trainer && trainer.userId) {
    return trainer.userId as mongoose.Types.ObjectId;
  }

  // 3. Fallback to user if exists
  if (user) {
    return user._id as mongoose.Types.ObjectId;
  }

  // 4. Try finding User by email if trainer has email
  if (trainer && trainer.email) {
    const userByEmail = await User.findOne({ email: trainer.email.toLowerCase() });
    if (userByEmail) return userByEmail._id as mongoose.Types.ObjectId;
  }

  return null;
};

// 1. Customer creates a manual plan request and messages trainer
export const createManualPlanRequest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const customer = req.user;
    if (!customer) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const {
      trainerId,
      planType = 'Workout Plan',
      title,
      goal,
      customerMessage,
      workoutDetails,
      dietDetails,
      videoDetails
    } = req.body;

    if (!trainerId || !title || !customerMessage) {
      res.status(400).json({
        success: false,
        message: 'Trainer, Title, and Message to trainer are required'
      });
      return;
    }

    const trainerUserId = await resolveTrainerUserId(trainerId);
    if (!trainerUserId) {
      res.status(404).json({ success: false, message: 'Trainer not found' });
      return;
    }

    // Resolve gymId
    let gymId: any = customer.gymId;
    if (!gymId) {
      const trainerUser = await User.findById(trainerUserId);
      gymId = trainerUser?.gymId;
    }
    if (!gymId) {
      const firstGym = await Gym.findOne().sort({ createdAt: -1 });
      gymId = firstGym?._id;
    }

    const customerUser = await User.findById(customer.id);
    const customerName = customerUser ? `${customerUser.firstName || ''} ${customerUser.lastName || ''}`.trim() : 'Customer';

    // Create TrainerPlanRequest
    const newRequest = await TrainerPlanRequest.create({
      customerId: customer.id,
      trainerId: trainerUserId,
      gymId,
      planType,
      title: title.trim(),
      goal: goal?.trim() || '',
      customerMessage: customerMessage.trim(),
      status: 'Pending',
      workoutDetails: workoutDetails || undefined,
      dietDetails: dietDetails || undefined,
      videoDetails: videoDetails || undefined
    });

    // 1. Notify Trainer
    await Notification.create({
      recipientId: trainerUserId,
      recipientRole: 'TRAINER',
      gymId,
      title: `New ${planType} Request: ${title.trim()}`,
      message: `${customerName} submitted a manual ${planType} ("${title.trim()}"). Message: "${customerMessage.trim()}". Please review and approve in your Trainer Dashboard.`,
      type: 'message',
      relatedRecordId: newRequest._id,
      link: '/trainer/dashboard',
      isRead: false
    });

    // 2. Direct message in chat
    await DirectMessage.create({
      senderId: customer.id,
      receiverId: trainerUserId,
      gymId,
      message: `[Manual Plan Request: ${planType}] "${title.trim()}" - ${customerMessage.trim()}`,
      read: false
    });

    const populated = await TrainerPlanRequest.findById(newRequest._id)
      .populate('trainerId', 'firstName lastName name email profilePhoto specialization')
      .populate('customerId', 'firstName lastName name email profilePhoto');

    res.status(201).json({
      success: true,
      message: 'Your plan and message have been sent to the trainer for approval!',
      request: populated
    });
  } catch (error: any) {
    console.error('createManualPlanRequest error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// 2. Customer gets all their trainer plans, approvals, and resources
export const getCustomerTrainerPlans = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const customer = req.user;
    if (!customer) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    // 1. Fetch all Trainer Plan Requests & Approvals
    const requests = await TrainerPlanRequest.find({ customerId: customer.id })
      .populate('trainerId', 'firstName lastName name email profilePhoto specialization experienceYears')
      .sort({ createdAt: -1 })
      .lean();

    // 2. Fetch active published Workout Plans assigned by trainers
    const publishedWorkoutPlans = await WorkoutPlan.find({
      customerId: customer.id,
      status: 'Published'
    })
      .populate({
        path: 'workoutDays.exercises.exerciseId',
        model: 'Exercise'
      })
      .populate('trainerId', 'firstName lastName name email profilePhoto specialization')
      .sort({ updatedAt: -1 })
      .lean();

    // 3. Fetch trainer assigned workout videos
    const workoutVideos = await WorkoutVideo.find({ customerId: customer.id })
      .populate('trainerId', 'name email profilePhoto specialization')
      .sort({ createdAt: -1 })
      .lean();

    // 4. Fetch gym exercise library
    let gymId: any = customer.gymId;
    if (!gymId) {
      const g = await Gym.findOne().sort({ createdAt: -1 });
      gymId = g?._id;
    }

    const exercises = await Exercise.find(gymId ? { gymId } : {})
      .sort({ category: 1, name: 1 })
      .lean();

    const gymDoc = gymId ? await Gym.findById(gymId).lean() : null;
    const allEquipments = gymDoc?.equipment || [];
    const approvedEquipments = allEquipments.filter((eq: any) => eq.isApproved === true);

    res.status(200).json({
      success: true,
      requests,
      publishedWorkoutPlans,
      workoutVideos,
      exercises,
      equipments: allEquipments,
      approvedEquipments
    });
  } catch (error: any) {
    console.error('getCustomerTrainerPlans error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// 3. Trainer gets all requests and messages sent by customers
export const getTrainerPlanRequests = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const trainerUser = req.user;
    if (!trainerUser) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const userDoc = await User.findById(trainerUser.id);
    const orConditions: any[] = [{ userId: trainerUser.id }];
    if (userDoc?.email) {
      orConditions.push({ email: userDoc.email.toLowerCase() });
    }

    // Find any Trainer documents linked to this user
    const trainerProfile = await Trainer.findOne({ $or: orConditions });

    const trainerIds: any[] = [new mongoose.Types.ObjectId(trainerUser.id)];
    if (trainerProfile?._id) {
      trainerIds.push(trainerProfile._id);
    }

    const requests = await TrainerPlanRequest.find({
      trainerId: { $in: trainerIds }
    })
      .populate('customerId', 'firstName lastName name email mobile profilePhoto fitnessGoal')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({ success: true, requests });
  } catch (error: any) {
    console.error('getTrainerPlanRequests error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// 4. Trainer gives approval to customer's manual plan
export const approveTrainerPlanRequest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { trainerFeedback } = req.body;

    const request = await TrainerPlanRequest.findById(id);
    if (!request) {
      res.status(404).json({ success: false, message: 'Plan request not found' });
      return;
    }

    request.status = 'Approved';
    request.trainerFeedback = trainerFeedback?.trim() || 'Approved by your trainer! Great customized routine.';
    request.approvedAt = new Date();
    await request.save();

    // If it's a Workout Plan, also publish to WorkoutPlan collection so it appears in standard workout tracker!
    if (request.planType === 'Workout Plan' && request.workoutDetails?.days?.length) {
      try {
        // Find existing exercise IDs or map them
        const gymExercises = await Exercise.find({ gymId: request.gymId });
        const exerciseNameMap = new Map<string, any>();
        gymExercises.forEach(e => exerciseNameMap.set(e.name.toLowerCase().trim(), e));

        const formattedDays = await Promise.all(
          request.workoutDetails.days.map(async (day, dIdx) => {
            const mappedExercises = await Promise.all(
              day.exercises.map(async (ex, eIdx) => {
                let exerciseDoc = exerciseNameMap.get(ex.name.toLowerCase().trim());
                if (!exerciseDoc) {
                  // Create quick exercise in library if missing
                  exerciseDoc = await Exercise.create({
                    gymId: request.gymId,
                    gymOwnerId: req.user?.id,
                    name: ex.name,
                    category: day.focus || 'Full Body',
                    targetMuscle: day.focus || 'Full Body',
                    difficulty: 'Intermediate',
                    equipment: 'Standard Gym Equipment',
                    instructions: ex.notes || 'Follow proper form and control.',
                    defaultSets: ex.sets || 3,
                    defaultRepetitions: parseInt(ex.reps) || 12,
                    defaultDuration: ex.duration || 60,
                    status: 'Active'
                  });
                }

                return {
                  exerciseId: exerciseDoc._id,
                  order: eIdx,
                  sets: ex.sets || 3,
                  repetitions: parseInt(ex.reps) || 12,
                  duration: ex.duration || 60,
                  restTime: parseInt(ex.rest || '60') || 60,
                  trainerNotes: ex.notes || ''
                };
              })
            );

            return {
              dayName: day.dayName || `Day ${dIdx + 1}`,
              focus: day.focus || 'Strength & Conditioning',
              exercises: mappedExercises
            };
          })
        );

        await WorkoutPlan.create({
          customerId: request.customerId,
          trainerId: req.user?.id || request.trainerId,
          gymId: request.gymId,
          planName: request.title,
          description: `Approved custom plan: ${request.customerMessage}`,
          status: 'Published',
          workoutDays: formattedDays,
          publishedAt: new Date()
        });
      } catch (subErr) {
        console.error('Error auto-syncing WorkoutPlan:', subErr);
      }
    }

    // If it's Exercise Videos, also create WorkoutVideo entries for the customer!
    if (request.planType === 'Exercise Videos' && request.videoDetails?.length) {
      try {
        for (const vid of request.videoDetails) {
          await WorkoutVideo.create({
            customerId: request.customerId,
            trainerId: req.user?.id || request.trainerId,
            gymId: request.gymId,
            title: vid.videoTitle || request.title,
            exerciseName: vid.exerciseName || request.title,
            videoUrl: vid.videoUrl || '',
            instructions: vid.instructions || request.trainerFeedback || 'Approved by trainer',
            difficultyLevel: 'Intermediate',
            duration: '10 mins',
            sets: '3',
            reps: '12',
            trainerNotes: request.trainerFeedback || 'Approved video guide',
            status: 'Assigned'
          });
        }
      } catch (vidErr) {
        console.error('Error auto-syncing WorkoutVideo:', vidErr);
      }
    }

    // Notify Customer of approval
    const trainerUser = await User.findById(req.user?.id);
    const trainerName = trainerUser ? `${trainerUser.firstName || ''} ${trainerUser.lastName || ''}`.trim() : 'Your Trainer';

    await Notification.create({
      recipientId: request.customerId,
      recipientRole: 'MEMBER',
      gymId: request.gymId,
      title: `Plan Approved by Coach ${trainerName}!`,
      message: `Your ${request.planType} "${request.title}" was approved by Coach ${trainerName}. Feedback: "${request.trainerFeedback}". It is now directly active in your dashboard!`,
      type: 'success',
      relatedRecordId: request._id,
      link: '/member/trainer-plan',
      isRead: false
    });

    // Send direct message back
    await DirectMessage.create({
      senderId: req.user?.id,
      receiverId: request.customerId,
      gymId: request.gymId,
      message: `[Plan Approved] Your ${request.planType} "${request.title}" has been approved! Note: ${request.trainerFeedback}`,
      read: false
    });

    const updated = await TrainerPlanRequest.findById(request._id)
      .populate('customerId', 'firstName lastName name email mobile profilePhoto')
      .populate('trainerId', 'firstName lastName name email profilePhoto');

    res.status(200).json({
      success: true,
      message: 'Plan approved and published to customer dashboard successfully!',
      request: updated
    });
  } catch (error: any) {
    console.error('approveTrainerPlanRequest error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// 5. Trainer rejects or requests changes
export const rejectTrainerPlanRequest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { trainerFeedback } = req.body;

    const request = await TrainerPlanRequest.findById(id);
    if (!request) {
      res.status(404).json({ success: false, message: 'Plan request not found' });
      return;
    }

    request.status = 'Rejected';
    request.trainerFeedback = trainerFeedback?.trim() || 'Modifications needed. Please contact trainer.';
    request.rejectedAt = new Date();
    await request.save();

    const trainerUser = await User.findById(req.user?.id);
    const trainerName = trainerUser ? `${trainerUser.firstName || ''} ${trainerUser.lastName || ''}`.trim() : 'Your Trainer';

    await Notification.create({
      recipientId: request.customerId,
      recipientRole: 'MEMBER',
      gymId: request.gymId,
      title: `Feedback on your ${request.planType}`,
      message: `Coach ${trainerName} reviewed "${request.title}". Note: "${request.trainerFeedback}". Please adjust and re-submit.`,
      type: 'info',
      relatedRecordId: request._id,
      link: '/member/trainer-plan',
      isRead: false
    });

    res.status(200).json({
      success: true,
      message: 'Request declined with feedback',
      request
    });
  } catch (error: any) {
    console.error('rejectTrainerPlanRequest error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// 6. Get available trainers for customer to select
export const getAvailableTrainers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const gymId = req.user?.gymId;

    const query: any = { role: 'TRAINER', isActive: { $ne: false } };
    if (gymId) {
      query.gymId = gymId;
    }

    let trainers = await User.find(query)
      .select('firstName lastName email profilePhoto specialization experienceYears bio gymId')
      .sort({ firstName: 1 })
      .lean();

    if (trainers.length === 0) {
      // Fallback: any trainer in DB
      trainers = await (User as any).find({ role: 'TRAINER' })
        .select('firstName lastName email profilePhoto specialization experienceYears bio gymId')
        .limit(10)
        .lean();
    }

    res.status(200).json({ success: true, trainers });
  } catch (error: any) {
    console.error('getAvailableTrainers error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// 7. Trainer directly approves & assigns an item (Exercise Library, Diet Plan, Workout Plan, Gym Exercise Video) to customer
export const approveAndAssignDirectly = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const trainerUser = req.user;
    if (!trainerUser) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const {
      customerId,
      planType, // 'Workout Plan' | 'Diet Plan' | 'Exercise Videos' | 'Exercise Library'
      title,
      goal,
      trainerFeedback,
      workoutDetails,
      dietDetails,
      videoDetails
    } = req.body;

    if (!customerId || !planType || !title) {
      res.status(400).json({ success: false, message: 'Customer, Plan Type, and Title are required' });
      return;
    }

    const customerUser = await User.findById(customerId);
    if (!customerUser) {
      res.status(404).json({ success: false, message: 'Customer not found' });
      return;
    }

    const trainerDoc = await User.findById(trainerUser.id);
    const trainerName = trainerDoc ? `${trainerDoc.firstName || ''} ${trainerDoc.lastName || ''}`.trim() : 'Your Trainer';

    let gymId = customerUser.gymId || trainerDoc?.gymId;
    if (!gymId) {
      const g = await Gym.findOne().sort({ createdAt: -1 });
      gymId = g?._id;
    }

    // Create the approved TrainerPlanRequest
    const newPlan = await TrainerPlanRequest.create({
      customerId,
      trainerId: trainerUser.id,
      gymId,
      planType,
      title: title.trim(),
      goal: goal?.trim() || `${planType} approved by trainer`,
      customerMessage: `Directly approved and assigned by Coach ${trainerName}`,
      trainerFeedback: trainerFeedback?.trim() || `Approved by Coach ${trainerName}. Ready in your dashboard!`,
      status: 'Approved',
      approvedAt: new Date(),
      workoutDetails: workoutDetails || undefined,
      dietDetails: dietDetails || undefined,
      videoDetails: videoDetails || undefined
    });

    // If Workout Plan, create published WorkoutPlan
    if (planType === 'Workout Plan' && workoutDetails?.days?.length) {
      try {
        const gymExercises = await Exercise.find({ gymId });
        const exerciseNameMap = new Map<string, any>();
        gymExercises.forEach(e => exerciseNameMap.set(e.name.toLowerCase().trim(), e));

        const formattedDays = await Promise.all(
          workoutDetails.days.map(async (day: any, dIdx: number) => {
            const mappedExercises = await Promise.all(
              (day.exercises || []).map(async (ex: any, eIdx: number) => {
                let exerciseDoc = exerciseNameMap.get(ex.name?.toLowerCase().trim());
                if (!exerciseDoc) {
                  exerciseDoc = await Exercise.create({
                    gymId,
                    gymOwnerId: trainerUser.id,
                    name: ex.name || 'Custom Exercise',
                    category: day.focus || 'Full Body',
                    targetMuscle: day.focus || 'Full Body',
                    difficulty: 'Intermediate',
                    equipment: 'Standard Gym Equipment',
                    instructions: ex.notes || 'Follow proper form and control.',
                    defaultSets: ex.sets || 3,
                    defaultRepetitions: parseInt(ex.reps) || 12,
                    defaultDuration: ex.duration || 60,
                    status: 'Active'
                  });
                }
                return {
                  exerciseId: exerciseDoc._id,
                  order: eIdx,
                  sets: ex.sets || 3,
                  repetitions: parseInt(ex.reps) || 12,
                  duration: ex.duration || 60,
                  restTime: parseInt(ex.rest || '60') || 60,
                  trainerNotes: ex.notes || ''
                };
              })
            );
            return {
              dayName: day.dayName || `Day ${dIdx + 1}`,
              focus: day.focus || 'Strength & Conditioning',
              exercises: mappedExercises
            };
          })
        );

        await WorkoutPlan.create({
          customerId,
          trainerId: trainerUser.id,
          gymId,
          planName: title,
          description: trainerFeedback || `Approved workout routine by Coach ${trainerName}`,
          status: 'Published',
          workoutDays: formattedDays,
          publishedAt: new Date()
        });
      } catch (e) {
        console.error('Error creating WorkoutPlan:', e);
      }
    }

    // If Exercise Videos, create assigned WorkoutVideo
    if (planType === 'Exercise Videos' && videoDetails?.length) {
      try {
        for (const vid of videoDetails) {
          await WorkoutVideo.create({
            customerId,
            trainerId: trainerUser.id,
            gymId,
            title: vid.videoTitle || title,
            exerciseName: vid.exerciseName || title,
            videoUrl: vid.videoUrl || '',
            instructions: vid.instructions || trainerFeedback || 'Approved by trainer',
            difficultyLevel: 'Intermediate',
            duration: '10 mins',
            sets: '3',
            reps: '12',
            trainerNotes: trainerFeedback || 'Approved video guide',
            status: 'Assigned'
          });
        }
      } catch (e) {
        console.error('Error creating WorkoutVideo:', e);
      }
    }

    // Create Notification for customer
    await Notification.create({
      recipientId: customerId,
      recipientRole: 'MEMBER',
      gymId,
      title: `New ${planType} Approved by Coach ${trainerName}!`,
      message: `Coach ${trainerName} has approved and assigned "${title}" to your dashboard. Check your Trainer's Plan and Start Now!`,
      type: 'success',
      relatedRecordId: newPlan._id,
      link: '/member/trainer-plan',
      isRead: false
    });

    // Create DirectMessage
    await DirectMessage.create({
      senderId: trainerUser.id,
      receiverId: customerId,
      gymId,
      message: `[Plan Approved] I have approved and assigned "${title}" (${planType}) to your dashboard! Note: ${trainerFeedback || 'Keep up the great work!'}`,
      read: false
    });

    const populated = await TrainerPlanRequest.findById(newPlan._id)
      .populate('customerId', 'firstName lastName name email mobile profilePhoto')
      .populate('trainerId', 'firstName lastName name email profilePhoto');

    res.status(201).json({
      success: true,
      message: `${planType} approved and sent to customer dashboard successfully!`,
      plan: populated
    });
  } catch (error: any) {
    console.error('approveAndAssignDirectly error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// 8. Get clients/members list for trainers
export const getTrainerClientsList = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const gymId = req.user?.gymId;
    const query: any = { role: 'MEMBER' };
    if (gymId) {
      query.gymId = gymId;
    }

    let clients = await User.find(query)
      .select('firstName lastName email mobile profilePhoto fitnessGoal gymId')
      .sort({ firstName: 1 })
      .lean();

    if (clients.length === 0) {
      clients = await (User as any).find({ role: 'MEMBER' })
        .select('firstName lastName email mobile profilePhoto fitnessGoal gymId')
        .limit(50)
        .lean();
    }

    res.status(200).json({ success: true, clients });
  } catch (error: any) {
    console.error('getTrainerClientsList error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const DEFAULT_GYM_EQUIPMENTS = [
  {
    name: 'Olympic Barbell & Bumper Plate Set',
    category: 'Free Weights',
    brand: 'Eleiko',
    quantity: 6,
    condition: 'Good',
    availability: 'Available',
    status: 'Active',
    nextService: '2026-12-01',
    isApproved: false
  },
  {
    name: 'Power Squat Rack & Pull-up Station',
    category: 'Strength Machines',
    brand: 'Rogue Fitness',
    quantity: 4,
    condition: 'Good',
    availability: 'Available',
    status: 'Active',
    nextService: '2026-11-15',
    isApproved: false
  },
  {
    name: 'Dual Adjustable Cable Crossover Machine',
    category: 'Cable Machines',
    brand: 'Life Fitness',
    quantity: 2,
    condition: 'Good',
    availability: 'Available',
    status: 'Active',
    nextService: '2026-10-30',
    isApproved: false
  },
  {
    name: 'Commercial Treadmill T8000',
    category: 'Cardio',
    brand: 'Technogym',
    quantity: 8,
    condition: 'Good',
    availability: 'Available',
    status: 'Active',
    nextService: '2026-11-20',
    isApproved: false
  },
  {
    name: 'Hex Dumbbell Set (2.5kg - 50kg Rack)',
    category: 'Free Weights',
    brand: 'Hammer Strength',
    quantity: 2,
    condition: 'Good',
    availability: 'Available',
    status: 'Active',
    nextService: '2026-12-15',
    isApproved: false
  },
  {
    name: '45-Degree Incline Leg Press Machine',
    category: 'Strength Machines',
    brand: 'Matrix Fitness',
    quantity: 2,
    condition: 'Good',
    availability: 'Available',
    status: 'Active',
    nextService: '2026-11-10',
    isApproved: false
  },
  {
    name: 'Commercial Concept2 Indoor Rower',
    category: 'Cardio',
    brand: 'Concept2',
    quantity: 3,
    condition: 'Good',
    availability: 'Available',
    status: 'Active',
    nextService: '2026-12-05',
    isApproved: false
  },
  {
    name: 'Seated Chest Press & Fly Selectorized Machine',
    category: 'Strength Machines',
    brand: 'Precor',
    quantity: 2,
    condition: 'Good',
    availability: 'Available',
    status: 'Active',
    nextService: '2026-11-25',
    isApproved: false
  }
];

// 9. Trainer gets gym equipments added by gym owner
export const getTrainerEquipments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const trainerUser = req.user;
    if (!trainerUser) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    let gymId: any = trainerUser.gymId;
    if (!gymId) {
      const trainerDoc = await Trainer.findOne({ userId: trainerUser.id });
      gymId = trainerDoc?.gymId;
    }

    let gym = gymId ? await Gym.findById(gymId) : null;
    if (!gym) {
      gym = await Gym.findOne().sort({ createdAt: -1 });
    }

    if (!gym) {
      res.status(200).json({ success: true, gymName: 'Gym', equipment: [] });
      return;
    }

    if (!gym.equipment || gym.equipment.length === 0) {
      gym.equipment = DEFAULT_GYM_EQUIPMENTS as any;
      await gym.save();
    }

    res.status(200).json({
      success: true,
      gymId: gym._id,
      gymName: gym.name,
      equipment: gym.equipment || []
    });
  } catch (error: any) {
    console.error('getTrainerEquipments error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// 10. Trainer approves gym equipment for customer dashboard
export const approveGymEquipment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const trainerUser = req.user;
    if (!trainerUser) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { id } = req.params;
    const { isApproved = true } = req.body;

    let gymId: any = trainerUser.gymId;
    if (!gymId) {
      const trainerDoc = await Trainer.findOne({ userId: trainerUser.id });
      gymId = trainerDoc?.gymId;
    }

    let gym = gymId ? await Gym.findById(gymId) : null;
    if (!gym) {
      gym = await Gym.findOne({
        $or: [
          { 'equipment._id': id },
          { 'equipment.id': id }
        ]
      });
      if (!gym) {
        gym = await Gym.findOne().sort({ createdAt: -1 });
      }
    }

    if (!gym || !gym.equipment) {
      res.status(404).json({ success: false, message: 'Gym or equipment not found' });
      return;
    }

    const eqItem: any = gym.equipment.find((e: any) =>
      (e._id && e._id.toString() === id) || e.id === id || (e as any)._id?.toString() === id
    );

    if (!eqItem) {
      res.status(404).json({ success: false, message: 'Equipment item not found in gym' });
      return;
    }

    const u = await User.findById(trainerUser.id).select('firstName lastName').lean();
    const trainerName = u ? `${u.firstName || ''} ${u.lastName || ''}`.trim() : 'Trainer';
    eqItem.isApproved = Boolean(isApproved);
    if (eqItem.isApproved) {
      eqItem.approvedBy = trainerUser.id as any;
      eqItem.approvedByName = trainerName;
      eqItem.approvedAt = new Date();
    } else {
      eqItem.isApproved = false;
      eqItem.approvedBy = undefined;
      eqItem.approvedByName = undefined;
      eqItem.approvedAt = undefined;
    }

    gym.markModified('equipment');
    await gym.save();

    res.status(200).json({
      success: true,
      message: eqItem.isApproved
        ? `Equipment "${eqItem.name}" approved and is now live on customer dashboard!`
        : `Equipment "${eqItem.name}" approval revoked.`,
      equipment: eqItem
    });
  } catch (error: any) {
    console.error('approveGymEquipment error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// 11. Customer gets gym equipments (with trainer approved status)
export const getCustomerEquipments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const customer = req.user;
    let gymId: any = customer?.gymId;
    if (!gymId) {
      const g = await Gym.findOne().sort({ createdAt: -1 });
      gymId = g?._id;
    }

    let gym = gymId ? await Gym.findById(gymId) : null;
    if (!gym) {
      gym = await Gym.findOne().sort({ createdAt: -1 });
    }

    if (gym && (!gym.equipment || gym.equipment.length === 0)) {
      gym.equipment = DEFAULT_GYM_EQUIPMENTS as any;
      await gym.save();
    }

    const equipment = gym?.equipment || [];
    const approvedEquipments = equipment.filter((e: any) => e.isApproved === true);

    res.status(200).json({
      success: true,
      gymName: gym?.name || 'Gym',
      equipment,
      approvedEquipments
    });
  } catch (error: any) {
    console.error('getCustomerEquipments error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};


