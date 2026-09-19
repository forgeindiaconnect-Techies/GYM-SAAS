import { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import AIRecommendation from '../models/AIRecommendation';
import User from '../models/User';
import Trainer from '../models/Trainer';

// Mock AI Service function
const mockAIGeneration = (fitnessProfile: any) => {
  return {
    aiAnalysis: {
      profileSummary: `Based on your profile, you are a ${fitnessProfile.age} year old ${fitnessProfile.gender} aiming for ${fitnessProfile.fitnessGoal}.`,
      goalRecommendations: `To achieve ${fitnessProfile.fitnessGoal}, a mix of resistance training and proper nutrition is required.`,
      generalActivity: `Maintain an active lifestyle, aiming for 8-10k steps daily.`,
    },
    workoutRecommendation: {
      weeklySchedule: `${fitnessProfile.availableWorkoutDays} days of focused training with adequate rest.`,
      exercises: [
        { name: 'Squats', sets: 4, reps: '8-10', duration: '10 mins', rest: '90s', difficulty: 'Medium' },
        { name: 'Bench Press', sets: 3, reps: '8-12', duration: '10 mins', rest: '90s', difficulty: 'Medium' },
        { name: 'Deadlift', sets: 3, reps: '6-8', duration: '15 mins', rest: '120s', difficulty: 'Hard' },
      ]
    },
    dietRecommendation: {
      generalStructure: `High protein, balanced carbs and healthy fats.`,
      mealTiming: `Eat every 3-4 hours. Post-workout meal is crucial.`,
      foodOptions: `Lean meats, eggs, oats, rice, vegetables based on ${fitnessProfile.foodPreferences || 'standard'} preferences.`,
    },
    routine: {
      dailyRoutine: `Wake up early, hydrate, and maintain consistent sleep.`,
      workoutDays: `${fitnessProfile.availableWorkoutDays} days a week.`,
      restDays: `Active recovery like walking or stretching.`,
      lifestyleSuggestions: `Drink 3-4 liters of water daily. Sleep 7-8 hours.`,
    },
    progressSuggestions: {
      focusAreas: `Focus on progressive overload and consistency.`,
      improvementSuggestions: `Gradually increase weights every 2 weeks.`,
      progressTracking: `Track body weight weekly and take progress photos monthly.`,
    }
  };
};

export const generateRecommendation = async (req: any, res: any) => {
  try {
    const { fitnessProfile } = req.body;
    const customerId = req.user.id;
    const gymId = req.user.gymId;

    // Check if the user is assigned to a trainer
    // Since we don't have a direct assignedTrainerId on User currently, we might need to look it up or leave it empty for now
    // For this implementation, we will leave trainerId null until assigned or look up if they have an active subscription with a trainer.

    // 1. Generate Mock AI Payload
    const generatedPayload = mockAIGeneration(fitnessProfile);

    // 2. Save new Recommendation
    const newRecommendation = new AIRecommendation({
      customerId,
      gymId,
      status: 'AI Generated',
      version: 1,
      fitnessProfile,
      ...generatedPayload
    });

    await newRecommendation.save();

    res.status(201).json({
      message: 'AI Recommendation generated successfully',
      recommendation: newRecommendation
    });

  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getLatestRecommendation = async (req: any, res: any) => {
  try {
    const customerId = req.user.id;
    const recommendation = await AIRecommendation.findOne({ customerId })
      .sort({ createdAt: -1 })
      .populate('trainerId', 'name');

    if (!recommendation) {
      return res.status(200).json({ recommendation: null });
    }

    res.status(200).json({ recommendation });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Trainer Endpoints

export const getAssignedCustomersWithAI = async (req: any, res: any) => {
  try {
    const trainerUserId = req.user.id;
    // Get the Trainer document for this user
    const trainer = await Trainer.findOne({ userId: trainerUserId });
    
    if (!trainer) {
      return res.status(404).json({ message: 'Trainer profile not found' });
    }

    // For simplicity, let's fetch ALL members of the same gym (in a real system, you'd filter by assigned customers)
    // We will simulate assigned customers by fetching users with role MEMBER in this gym
    const members = await User.find({ gymId: trainer.gymId, role: 'MEMBER' } as any);

    // For each member, find their latest AI recommendation
    const customersWithAI = await Promise.all(members.map(async (member) => {
      const latestAI = await AIRecommendation.findOne({ customerId: member._id }).sort({ createdAt: -1 });
      return {
        _id: member._id,
        firstName: member.firstName,
        lastName: member.lastName,
        goal: member.fitnessGoal || latestAI?.fitnessProfile?.fitnessGoal || 'Not specified',
        aiStatus: latestAI ? latestAI.status : 'No Data',
        lastUpdated: latestAI ? latestAI.updatedAt : null,
        latestRecommendationId: latestAI ? latestAI._id : null
      };
    }));

    res.status(200).json({ customers: customersWithAI });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getCustomerRecommendation = async (req: any, res: any) => {
  try {
    const { customerId } = req.params;
    const recommendation = await AIRecommendation.findOne({ customerId }).sort({ createdAt: -1 });
    
    if (!recommendation) {
      return res.status(404).json({ message: 'No AI recommendation found for this customer' });
    }

    res.status(200).json({ recommendation });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const reviewRecommendation = async (req: any, res: any) => {
  try {
    const { id } = req.params; // Original recommendation ID
    const trainerUserId = req.user.id;
    
    const trainer = await Trainer.findOne({ userId: trainerUserId });
    if (!trainer) return res.status(404).json({ message: 'Trainer profile not found' });

    const originalRecommendation = await AIRecommendation.findById(id);
    if (!originalRecommendation) {
      return res.status(404).json({ message: 'Original recommendation not found' });
    }

    const {
      workoutRecommendation,
      dietRecommendation,
      routine,
      progressSuggestions,
      trainerNotes
    } = req.body;

    // Archive the original recommendation
    originalRecommendation.status = 'Archived';
    await originalRecommendation.save();

    // Create a new version
    const newRecommendation = new AIRecommendation({
      customerId: originalRecommendation.customerId,
      gymId: originalRecommendation.gymId,
      branchId: originalRecommendation.branchId,
      trainerId: trainer._id,
      status: 'Trainer Approved',
      version: originalRecommendation.version + 1,
      originalRecommendationId: originalRecommendation._id,
      fitnessProfile: originalRecommendation.fitnessProfile, // Copy profile snapshot
      aiAnalysis: originalRecommendation.aiAnalysis, // Copy original analysis
      workoutRecommendation,
      dietRecommendation,
      routine,
      progressSuggestions,
      trainerNotes,
      approvedAt: new Date()
    });

    await newRecommendation.save();

    res.status(200).json({
      message: 'Recommendation approved and assigned successfully',
      recommendation: newRecommendation
    });

  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
