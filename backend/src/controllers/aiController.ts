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

import { 
  mockAIGeneration, 
  generateGeminiFitnessPlan, 
  chatWithGeminiAssistant 
} from '../utils/geminiService';

export { mockAIGeneration };


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

    // Sync updated customer registered details to User profile
    if (userDoc) {
      if (fitnessProfile.height) userDoc.height = Number(fitnessProfile.height);
      if (fitnessProfile.weight) userDoc.weight = Number(fitnessProfile.weight);
      if (fitnessProfile.fitnessGoal) userDoc.fitnessGoal = fitnessProfile.fitnessGoal;
      if (fitnessProfile.currentFitnessLevel) userDoc.experienceLevel = fitnessProfile.currentFitnessLevel;
      if (fitnessProfile.preferredTraining) userDoc.preferredTraining = fitnessProfile.preferredTraining;
      if (fitnessProfile.preferredWorkoutTime) userDoc.preferredWorkoutTime = fitnessProfile.preferredWorkoutTime;
      if (fitnessProfile.gender) userDoc.gender = fitnessProfile.gender;
      if (fitnessProfile.city) userDoc.city = fitnessProfile.city;
      if (fitnessProfile.pinCode) userDoc.pinCode = fitnessProfile.pinCode;
      if (fitnessProfile.emergencyContactName || fitnessProfile.emergencyContactMobile) {
        userDoc.emergencyContact = {
          name: fitnessProfile.emergencyContactName || userDoc.emergencyContact?.name || '',
          relationship: fitnessProfile.emergencyContactRelation || userDoc.emergencyContact?.relationship || '',
          mobile: fitnessProfile.emergencyContactMobile || userDoc.emergencyContact?.mobile || ''
        };
      }
      await userDoc.save();
    }

    // 1. Generate complete AI draft payload with Gemini (fallback to expert engine if needed)
    const generatedPayload = await generateGeminiFitnessPlan(fitnessProfile);

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
    
    const branchIdQuery = req.query.branchId as string;
    const effectiveBranchId = req.user?.branchId || branchIdQuery;

    const pipeline: any[] = [
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
    ];

    if (effectiveBranchId && effectiveBranchId !== 'all') {
      if (effectiveBranchId === 'main') {
        pipeline.push({
          $match: {
            $or: [
              { 'customer.branchId': { $exists: false } },
              { 'customer.branchId': null }
            ]
          }
        });
      } else {
        pipeline.push({
          $match: {
            'customer.branchId': new mongoose.Types.ObjectId(effectiveBranchId)
          }
        });
      }
    }

    const recommendations = await AIRecommendation.aggregate(pipeline);

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

    const { message, history, pageContext } = req.body;
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

    const trainerName = trainerInfo
      ? `${trainerInfo.firstName || trainerInfo.name || 'Trainer'} ${trainerInfo.lastName || ''}`.trim()
      : null;

    let reply = '';

    // Attempt Gemini AI Assistant first
    try {
      const upcoming = sessions.find((s: any) => {
        const status = (s.status || '').toLowerCase();
        return status === 'pending' || status === 'confirmed' || status === 'accepted' || status === 'booked';
      }) || (sessions.length > 0 ? sessions[0] : null);

      const nextSessionStr = upcoming
        ? `${(upcoming as any).sessionTitle || 'Personal Training'} on ${formatDateStr((upcoming as any).date)} at ${(upcoming as any).startTime || '09:00 AM'} with ${(upcoming as any).trainerId ? ((upcoming as any).trainerId.firstName || (upcoming as any).trainerId.name) : (trainerName || 'assigned trainer')} (Status: ${(upcoming as any).status})`
        : undefined;

      const latestP = (payments && payments.length > 0) ? (payments[0] as any) : null;
      const paymentSummary = latestP
        ? `Latest payment ₹${latestP.amount} on ${formatDateStr(latestP.createdAt)} (${latestP.status || 'Completed'})`
        : 'No payment dues';

      const latestLog = (progressLogs && progressLogs.length > 0) ? (progressLogs[0] as any) : null;
      const progressSummary = latestLog
        ? `Latest weight: ${latestLog.weight || '-'} kg, Workouts logged: ${latestLog.workoutsCompleted || 1}, Calories: ${latestLog.caloriesBurned || '-'} kcal`
        : undefined;

      const rec = recommendations as any;
      const planSummary = rec
        ? `Status: ${rec.status}, Goal: ${rec.fitnessProfile?.fitnessGoal || userAny.fitnessGoal || 'General Fitness'}`
        : undefined;

      reply = await chatWithGeminiAssistant(
        message.trim(),
        {
          name: userAny.firstName || 'Member',
          gender: userAny.gender,
          goal: userAny.fitnessGoal || rec?.fitnessProfile?.fitnessGoal,
          level: userAny.experienceLevel || rec?.fitnessProfile?.currentFitnessLevel,
          trainerName: trainerName || undefined,
          trainerSpecialization: trainerInfo?.specialization || trainerInfo?.expertise,
          nextSession: nextSessionStr,
          totalSessions: sessions.length,
          membershipPlan: memberships?.[0]?.planName || userAny.subscriptionPlan || 'Active Member',
          paymentSummary,
          progressSummary,
          planSummary,
          pageContext: pageContext || 'Customer Dashboard'
        },
        Array.isArray(history) ? history : []
      );
    } catch (geminiErr: any) {
      console.warn('Gemini Assistant fallback triggered:', geminiErr.message);
    }

    // Graceful Rule-Based Fallback if Gemini did not produce a reply
    if (!reply) {
      // 1. Booking Status / Sessions Status
      if (q.includes('booking') || (q.includes('session') && (q.includes('status') || q.includes('book')))) {
        if (sessions && sessions.length > 0) {
          const latest = sessions[0] as any;
          const latestTrainer = latest.trainerId ? `${latest.trainerId.firstName || latest.trainerId.name || 'Trainer'} ${latest.trainerId.lastName || ''}`.trim() : (trainerName || 'assigned trainer');
          const sessionDate = formatDateStr(latest.date);
          reply = `You have **${sessions.length}** session booking(s) on record. Your latest booking for **${latest.sessionTitle || '1-on-1 Coaching'}** with **${latestTrainer}** is scheduled for **${sessionDate}** at **${latest.startTime || '09:00 AM'}** (Status: **${latest.status || 'Pending'}**).`;
        } else {
          reply = "You currently have no session bookings. You can browse expert coaches and book a 1-on-1 session under **Find Trainers**!";
        }
      } 
      // 2. Next Session / When is my next session
      else if (q.includes('next session') || q.includes('when is my next') || (q.includes('upcoming') && q.includes('session'))) {
        const upcoming = sessions.find((s: any) => {
          const status = (s.status || '').toLowerCase();
          return status === 'pending' || status === 'confirmed' || status === 'accepted' || status === 'booked';
        }) || (sessions.length > 0 ? sessions[0] : null);

        if (upcoming) {
          const upSess = upcoming as any;
          const upTrainer = upSess.trainerId ? `${upSess.trainerId.firstName || upSess.trainerId.name || 'Trainer'} ${upSess.trainerId.lastName || ''}`.trim() : (trainerName || 'your trainer');
          reply = `Your next session **${upSess.sessionTitle || 'Personal Training'}** is on **${formatDateStr(upSess.date)}** at **${upSess.startTime || '09:00 AM'}** with **${upTrainer}** (Status: **${upSess.status}**).`;
        } else {
          reply = "You have no upcoming sessions scheduled. Visit **Find Trainers** or **Book Session** to pick your time slot!";
        }
      }
      // 3. Who is my trainer
      else if (q.includes('trainer') || q.includes('coach') || q.includes('who is my')) {
        if (trainerName) {
          const spec = trainerInfo?.specialization || trainerInfo?.expertise || 'Fitness & Conditioning';
          reply = `Your assigned personal trainer is **${trainerName}** (Specialization: **${spec}**). You can send messages directly to your trainer under **Messages**!`;
        } else {
          reply = "You currently don't have a personal trainer assigned. Browse our certified trainers under **Find Trainers** to select your coach!";
        }
      }
      // 4. Show my workout plan / Diet / Assessment
      else if (q.includes('workout plan') || q.includes('plan') || q.includes('workout') || q.includes('diet')) {
        const rec = recommendations as any;
        if (rec && (rec.status === 'Trainer Approved' || rec.status === 'Approved')) {
          const goal = rec.fitnessProfile?.fitnessGoal || 'General Fitness';
          reply = `Your trainer-approved plan for **${goal}** is active! Target Calories: **${rec.aiOutput?.caloricTarget || '2,100 kcal/day'}**, Protein: **${rec.aiOutput?.proteinTarget || '130g/day'}**. View your full routines under **Workout Plan**.`;
        } else if (rec) {
          reply = `Your AI Assessment is submitted and currently **${rec.status}**. Your trainer will review and activate your plan shortly!`;
        } else {
          reply = "You haven't completed your fitness assessment yet. Head to **AI Assistant** to get a custom workout and diet plan!";
        }
      }
      // 5. Payment status / Payments / Membership fee
      else if (q.includes('payment') || q.includes('paid') || q.includes('bill') || q.includes('invoice') || q.includes('fee')) {
        if (payments && payments.length > 0) {
          const latestP = payments[0] as any;
          reply = `You have **${payments.length}** payment record(s). Your latest payment of **₹${latestP.amount}** on **${formatDateStr(latestP.createdAt)}** via **${latestP.paymentMethod || 'Online'}** was **${latestP.status || 'Completed'}**. Your membership status is **${userAny.subscriptionPlan || 'Active'}**.`;
        } else if (memberships && memberships.length > 0) {
          const latestM = memberships[0] as any;
          reply = `Your active membership plan is **${latestM.planName || userAny.subscriptionPlan || 'Standard Member'}** (Status: **${latestM.status || 'Active'}**).`;
        } else {
          reply = `Your account membership status is **${userAny.subscriptionPlan || 'Active Member'}**. Check **Payment History** for transaction logs.`;
        }
      }
      // 6. How is my progress / Weight / Log
      else if (q.includes('progress') || q.includes('weight') || q.includes('log') || q.includes('tracking')) {
        if (progressLogs && progressLogs.length > 0) {
          const latestLog = progressLogs[0] as any;
          reply = `You have recorded **${progressLogs.length}** progress entry(ies)! Latest log on **${formatDateStr(latestLog.date || latestLog.createdAt)}**: Weight: **${latestLog.weight || '-'} kg**, Workouts Completed: **${latestLog.workoutsCompleted || 1}**, Calories Burned: **${latestLog.caloriesBurned || '-'} kcal**.`;
        } else {
          reply = "You haven't logged any progress entries yet. Track your weight, workout completion, and calories in **Customer Progress** to visualize your results!";
        }
      }
      // 7. How can I improve my fitness / Fitness tips / Advice
      else if (q.includes('improve') || q.includes('tip') || q.includes('advice') || q.includes('better') || q.includes('fitness')) {
        const goal = (recommendations as any)?.fitnessProfile?.fitnessGoal || 'General Fitness';
        reply = `Here are personalized recommendations to boost your **${goal}**:
1. **Consistent Training**: Complete 3-4 structured sessions every week with progressive overload.
2. **Optimal Protein & Hydration**: Target ~1.6g to 2.0g protein per kg bodyweight and drink 3+ liters of water daily.
3. **Rest & Recovery**: Ensure 7-8 hours of sleep per night for optimal muscle repair.
4. **Trainer Chat**: Message your coach under **Messages** for custom adjustments to your routines!`;
      }
      // 8. Store / Orders
      else if (q.includes('order') || q.includes('store') || q.includes('purchase') || q.includes('cart')) {
        if (orders && orders.length > 0) {
          const latestO = orders[0] as any;
          reply = `You have **${orders.length}** order(s) in Gym Store. Latest order **#${latestO._id.toString().slice(-6)}**: Total **₹${latestO.totalAmount}** (Status: **${latestO.status || 'Processing'}**).`;
        } else {
          reply = "You haven't placed any store orders yet. Check out fitness gear, supplements, and apparel in **Gym Store**!";
        }
      }
      // 9. Greetings
      else if (q === 'hi' || q === 'hello' || q === 'hey' || q.startsWith('hi ') || q.startsWith('hello ')) {
        reply = `Hello **${userAny.firstName}**! 👋 How can I help you today? You can ask about your booking status, next session, assigned trainer, workout plan, payment status, or progress.`;
      }
      // 10. Default Smart Context-Aware Answer
      else {
        const trainerStr = trainerName ? `assigned to trainer **${trainerName}**` : 'currently unassigned to a personal trainer';
        const sessionStr = sessions && sessions.length > 0 ? `have **${sessions.length}** session booking(s)` : 'have no active session bookings';
        reply = `Hello **${userAny.firstName}**! You are ${trainerStr} and ${sessionStr}. I can assist you with your **Booking Status**, **Next Session**, **Trainer Info**, **Workout & Diet Plan**, **Payment History**, or **Progress Tracking**. What would you like to check?`;
      }
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
