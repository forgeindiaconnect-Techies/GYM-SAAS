import { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import mongoose from 'mongoose';
import AIRecommendation from '../models/AIRecommendation';
import User from '../models/User';
import Trainer from '../models/Trainer';

// Mock AI Service function (Rule-Based Demo)
const mockAIGeneration = (fitnessProfile: any) => {
  const goal = fitnessProfile.fitnessGoal || 'General Fitness';
  let assessment = '';
  
  if (goal.toLowerCase().includes('weight loss')) {
    assessment = 'Focus on calorie-controlled nutrition, strength training, cardio, hydration, and consistent activity. Based on your current fitness profile and weight-loss goal, your primary focus should be gradual fat loss while maintaining muscle mass. A combination of strength training, moderate cardio, adequate hydration, and a balanced diet is recommended.';
  } else if (goal.toLowerCase().includes('weight gain')) {
    assessment = 'Focus on adequate calorie intake, protein-rich foods, progressive strength training, and recovery. Based on your profile, you need a caloric surplus combined with heavy lifting to stimulate muscle growth effectively.';
  } else if (goal.toLowerCase().includes('muscle building')) {
    assessment = 'Focus on resistance training, sufficient protein, progressive overload, recovery, and balanced nutrition. Your primary objective is hypertrophy, so maintaining a slight caloric surplus with high protein is crucial.';
  } else {
    assessment = 'Focus on balanced strength, cardio, mobility, hydration, sleep, and consistency. Your goal of general fitness means building a well-rounded routine that improves your overall health and stamina.';
  }

  // Parse days (default to 4)
  let days = parseInt(fitnessProfile.availableWorkoutDays) || 4;
  if (fitnessProfile.availableWorkoutDays && fitnessProfile.availableWorkoutDays.includes('1-2')) days = 2;
  if (fitnessProfile.availableWorkoutDays && fitnessProfile.availableWorkoutDays.includes('3-4')) days = 4;
  if (fitnessProfile.availableWorkoutDays && fitnessProfile.availableWorkoutDays.includes('5-6')) days = 6;
  if (fitnessProfile.availableWorkoutDays && fitnessProfile.availableWorkoutDays.includes('Every day')) days = 7;
  
  const scheduleTemplate = [
    { day: 'Monday', workout: 'Full Body Strength', duration: '45 min' },
    { day: 'Tuesday', workout: 'Cardio + Core', duration: '30 min' },
    { day: 'Wednesday', workout: 'Rest / Mobility', duration: '20 min' },
    { day: 'Thursday', workout: 'Upper Body', duration: '45 min' },
    { day: 'Friday', workout: 'Lower Body', duration: '45 min' },
    { day: 'Saturday', workout: 'Light Cardio', duration: '30 min' },
    { day: 'Sunday', workout: 'Rest', duration: '-' },
  ];
  
  // Adjust schedule based on number of days
  const weeklySchedule = scheduleTemplate.map((item, index) => {
    if (days < 3 && index % 2 !== 0) return { ...item, workout: 'Rest', duration: '-' };
    if (days < 5 && (index === 2 || index === 5)) return { ...item, workout: 'Rest', duration: '-' };
    return item;
  });

  return {
    aiAnalysis: {
      profileSummary: `Current Weight: ${fitnessProfile.weight || '-'} kg\nTarget Weight: ${fitnessProfile.targetWeight || '-'} kg\nHeight: ${fitnessProfile.height || '-'} cm\nFitness Goal: ${goal}\nActivity Level: ${fitnessProfile.activityLevel || '-'}\nExperience: ${fitnessProfile.experienceLevel || '-'}\nRecommended Frequency: ${days} days/week`,
      assessment: `Based on your current fitness profile and ${goal} goal, your primary focus should be gradual progress. ${assessment}`,
    },
    workoutRecommendation: {
      weeklySchedule: weeklySchedule,
      exercises: [
        { name: 'Squats', sets: 3, reps: '12', duration: '10 min', rest: '60s', difficulty: fitnessProfile.experienceLevel || 'Beginner', targetMuscleGroup: 'Legs & Glutes' },
        { name: 'Push-ups', sets: 3, reps: '10', duration: '8 min', rest: '60s', difficulty: fitnessProfile.experienceLevel || 'Beginner', targetMuscleGroup: 'Chest & Triceps' },
        { name: 'Plank', sets: 3, reps: '30 sec', duration: '5 min', rest: '45s', difficulty: fitnessProfile.experienceLevel || 'Beginner', targetMuscleGroup: 'Core' },
        { name: 'Dumbbell Rows', sets: 3, reps: '12', duration: '10 min', rest: '60s', difficulty: fitnessProfile.experienceLevel || 'Beginner', targetMuscleGroup: 'Back & Biceps' },
        { name: 'Lunges', sets: 3, reps: '10/leg', duration: '8 min', rest: '60s', difficulty: fitnessProfile.experienceLevel || 'Beginner', targetMuscleGroup: 'Legs & Glutes' }
      ]
    },
    dietRecommendation: {
      morning: 'Oats / Eggs / Fruit / Water',
      breakfast: 'Protein-rich meal, Whole grains, Fruit',
      lunch: 'Rice / Roti, Vegetables, Protein source, Salad',
      evening: 'Fruit / Nuts / Healthy snack',
      dinner: 'Protein source, Vegetables, Controlled carbohydrate portion',
      note: 'This is a demo fitness recommendation and should not be treated as medical or clinical advice.'
    },
    routine: {
      morning: 'Hydration, Light stretching, Breakfast',
      workoutTime: 'Warm-up, Main workout, Cool-down',
      evening: 'Light activity / walking, Hydration',
      night: `Balanced dinner, Recovery, Recommended sleep duration (${fitnessProfile.averageSleep || '7-8 hours'})`
    },
    progressSuggestions: {
      focusAreas: 'Focus on progressive overload and consistency.',
      improvementSuggestions: 'Gradually increase intensity every 2 weeks.',
      progressTracking: 'Track body weight weekly and take progress photos monthly.'
    }
  };
};

export const generateRecommendation = async (req: any, res: any) => {
  try {
    const { fitnessProfile } = req.body;
    const customerId = req.user.id;
    const gymId = req.user.gymId;

    // 1. Generate Mock AI Payload
    const generatedPayload = mockAIGeneration(fitnessProfile);

    // Get previous recommendation for versioning and tracking
    const previous = await AIRecommendation.findOne({ customerId }).sort({ createdAt: -1 });
    const newVersion = previous ? (previous.version || 1) + 1 : 1;
    const startingWeight = previous?.fitnessProfile?.weight || fitnessProfile.weight;

    if (generatedPayload.progressSuggestions) {
      (generatedPayload.progressSuggestions as any).startingWeight = startingWeight;
    }

    // 2. Save new Recommendation
    const newRecommendation = new AIRecommendation({
      customerId,
      gymId,
      status: 'AI Generated',
      version: newVersion,
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
    const recommendations = await AIRecommendation.find({ customerId })
      .sort({ createdAt: -1 })
      .limit(2)
      .populate('trainerId', 'name');

    if (!recommendations || recommendations.length === 0) {
      return res.status(200).json({ recommendation: null, history: [] });
    }

    const recommendation = recommendations[0];
    const history = recommendations.length > 1 ? [recommendations[1]] : [];

    res.status(200).json({ recommendation, history });
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
      trainerNotes,
      revisionDetails,
      status
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
      status: status || 'Trainer Approved',
      version: originalRecommendation.version + 1,
      originalRecommendationId: originalRecommendation._id,
      fitnessProfile: originalRecommendation.fitnessProfile, // Copy profile snapshot
      aiAnalysis: originalRecommendation.aiAnalysis, // Copy original analysis
      workoutRecommendation,
      dietRecommendation,
      routine,
      progressSuggestions,
      trainerNotes,
      revisionDetails,
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

export const getTrainerRecommendations = async (req: any, res: any) => {
  try {
    const trainerUserId = req.user.id;
    const trainer = await Trainer.findOne({ userId: trainerUserId });
    
    if (!trainer) {
      return res.status(404).json({ message: 'Trainer not found' });
    }

    const recommendations = await AIRecommendation.find({ trainerId: trainer._id })
      .populate('customerId', 'firstName lastName profilePhoto')
      .sort({ createdAt: -1 });

    res.status(200).json({ recommendations });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Admin Endpoints

export const getAdminRecommendations = async (req: any, res: any) => {
  try {
    let gymId = req.user.gymId;
    if (!gymId && req.user.role === 'GYM_OWNER') {
      const gym = await mongoose.model('Gym').findOne({ ownerId: req.user.id });
      if (gym) gymId = gym._id;
    }
    
    if (!gymId) {
      return res.status(400).json({ message: 'Gym ID is required' });
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
    res.status(500).json({ error: error.message });
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
      return res.status(400).json({ message: 'Gym ID is required' });
    }
    
    // Get the specified recommendation
    const recommendation = await AIRecommendation.findOne({ _id: id, gymId })
      .populate('customerId', 'name email profileImage height')
      .populate('trainerId', 'name profileImage');
      
    if (!recommendation) {
      return res.status(404).json({ message: 'Recommendation not found' });
    }
    
    // Get the history for this customer
    const history = await AIRecommendation.find({ customerId: recommendation.customerId, gymId })
      .sort({ createdAt: -1 })
      .populate('trainerId', 'name');

    res.status(200).json({ recommendation, history });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
