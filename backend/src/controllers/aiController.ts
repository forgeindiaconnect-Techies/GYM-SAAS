
import TrainerSession from '../models/TrainerSession';
import CustomerMembership from '../models/CustomerMembership';
import Payment from '../models/Payment';
import StoreOrder from '../models/StoreOrder';
import ProgressLog from '../models/ProgressLog';
import Notification from '../models/Notification';

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
      .populate('customerId', 'firstName lastName profilePhoto email')
      .populate('trainerId', 'name')
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

/* ── Member reply to trainer ─────────────────────────────────── */
export const memberReplyToTrainer = async (req: ExpressRequest, res: ExpressResponse) => {
  try {
    const userId = (req as any).user?.id;
    const gymId  = (req as any).user?.gymId;
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Reply message is required.' });
    }

    // Find the latest recommendation for this member
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

/* ── Trainer reply to member ─────────────────────────────────── */
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



/* ── Context-Aware Customer AI Chatbot ──────────────────────────── */
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

    // 1. Retrieve authenticated customer's actual data from DB
    const [userDoc, sessions, memberships, orders, payments, recommendations, progressLogs, notifications] = await Promise.all([
      User.findById(customerId).populate('assignedTrainer').lean(),
      TrainerSession.find({ customerId }).populate('trainerId').sort({ date: 1, startTime: 1 }).lean(),
      CustomerMembership.find({ customerId }).sort({ createdAt: -1 }).lean(),
      StoreOrder.find({ customerId }).sort({ createdAt: -1 }).lean(),
      Payment.find({ customerId }).sort({ createdAt: -1 }).lean(),
      AIRecommendation.findOne({ customerId }).sort({ createdAt: -1 }).lean(),
      ProgressLog.find({ customerId }).sort({ date: -1 }).limit(5).lean(),
      Notification.find({ userId: customerId, read: false }).limit(5).lean()
    ]);

    if (!userDoc) {
      return res.status(404).json({ success: false, message: 'Customer profile not found' });
    }

    const userAny = userDoc as any;

    // Determine assigned trainer details
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
    // Fallback: check latest session trainer
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

    // Intent 1: Booking Status & Trainer Bookings
    if (q.includes('booking status') || q.includes('status of my booking') || q.includes('approved my session') || q.includes('approved my booking') || q.includes('pending booking') || q.includes('has my trainer approved') || (q.includes('booking') && q.includes('status'))) {
      if (!sessions || sessions.length === 0) {
        reply = "You currently have no trainer booking requests. You can browse and book a trainer under the **Find Trainers** section.";
      } else {
        const pendingBooking = sessions.find((s: any) => s.status === 'Pending');
        const confirmedBooking = sessions.find((s: any) => s.status === 'Confirmed' || s.status === 'Approved');
        const latestBooking = sessions[sessions.length - 1] as any;

        const latestTrainer = latestBooking?.trainerId;

        const trainerName = trainerInfo ? `${trainerInfo.firstName || trainerInfo.name || 'Trainer'} ${trainerInfo.lastName || ''}`.trim() : (latestTrainer ? `${latestTrainer.firstName || latestTrainer.name || ''} ${latestTrainer.lastName || ''}`.trim() : 'your trainer');

        if (q.includes('approved my session') || q.includes('approved my booking') || q.includes('has my trainer approved')) {
          if (confirmedBooking) {
            reply = `Yes. Your session with **${trainerName}** on **${formatDateStr((confirmedBooking as any).date)}**, from **${(confirmedBooking as any).startTime} to ${(confirmedBooking as any).endTime}** has been approved.`;
          } else if (pendingBooking) {
            reply = `Your booking with **${trainerName}** is currently **Pending**. The trainer has not approved the booking yet.`;
          } else {
            reply = `Your session with **${trainerName}** is currently **${latestBooking.status}**.`;
          }
        } else if (pendingBooking) {
          reply = `Your booking with **${trainerName}** is currently **Pending**. The trainer has not approved the booking yet.`;
        } else if (confirmedBooking) {
          reply = `Your session with **${trainerName}** on **${formatDateStr((confirmedBooking as any).date)}**, from **${(confirmedBooking as any).startTime} to ${(confirmedBooking as any).endTime}** has been approved.`;
        } else {
          reply = `Your latest booking with **${trainerName}** (ID: #${latestBooking.bookingId || latestBooking._id.toString().slice(-6).toUpperCase()}) status is **${latestBooking.status}**.`;
        }
      }
    }
    // Intent 2: Next Session & Upcoming Sessions
    else if (q.includes('next session') || q.includes('upcoming session') || q.includes('when is my session') || q.includes('when is my next') || (q.includes('session') && (q.includes('when') || q.includes('time') || q.includes('date')))) {
      const todayStr = new Date().toISOString().split('T')[0];
      const upcoming = sessions.filter((s: any) => s.date >= todayStr && s.status !== 'Cancelled' && s.status !== 'Rejected');
      
      if (upcoming.length > 0) {
        const next = upcoming[0] as any;
        const nextTrainer = next.trainerId;
        const trainerName = trainerInfo ? `${trainerInfo.firstName || trainerInfo.name || ''} ${trainerInfo.lastName || ''}`.trim() : (nextTrainer ? `${nextTrainer.firstName || nextTrainer.name || ''} ${nextTrainer.lastName || ''}`.trim() : 'your trainer');
        reply = `Your next ${next.mode === 'Online' ? 'online' : 'in-person'} training session is **${formatDateStr(next.date)}**, from **${next.startTime} to ${next.endTime}** with **${trainerName}**.`;
      } else {
        reply = "You currently have no upcoming sessions scheduled. You can book a session with a trainer from the **Find Trainers** page.";
      }
    }
    // Intent 3: Trainer Details
    else if (q.includes('who is my trainer') || q.includes('my trainer') || q.includes('assigned trainer') || q.includes('trainer details') || q.includes('who trainer') || q.includes('trainer name')) {
      if (trainerInfo && (trainerInfo.firstName || trainerInfo.name)) {
        const name = `${trainerInfo.firstName || trainerInfo.name || ''} ${trainerInfo.lastName || ''}`.trim();
        const title = trainerInfo.specialization || trainerInfo.title || 'Elite Fitness Trainer';
        reply = `Your assigned trainer is **${name}**, an **${title}**.`;
      } else {
        reply = "You do not have an assigned trainer yet. You can browse certified trainers and request a booking under **Find Trainers**.";
      }
    }
    // Intent 4: Payments & Fees
    else if (q.includes('how much did i pay') || q.includes('payment status') || q.includes('my payment') || q.includes('latest payment') || q.includes('session payment') || q.includes('paid') || q.includes('fee')) {
      if (payments && payments.length > 0) {
        const latestPay = payments[0] as any;
        reply = `Your latest session payment was **₹${latestPay.amount}** and the payment status is **${latestPay.status || 'Paid'}**.`;
      } else if (sessions && sessions.length > 0) {
        const paidSession = (sessions.find((s: any) => s.paymentStatus === 'Paid' || s.fee > 0) || sessions[0]) as any;
        const fee = paidSession.fee || 500;
        const status = paidSession.paymentStatus || (paidSession.status === 'Confirmed' ? 'Paid' : 'Pending');
        reply = `Your latest session payment was **₹${fee}** and the payment status is **${status}**.`;
      } else {
        reply = "Your payment records show no recent session charges. You can review all invoices under **Account -> Payments**.";
      }
    }
    // Intent 5: Workout Plan
    else if (q.includes('workout plan') || q.includes('show my workout') || q.includes('show me my workout') || q.includes('my workout') || q.includes('exercise plan') || q.includes('routine')) {
      const recAny = recommendations as any;
      if (recAny && recAny.fitnessProfile) {
        const goal = recAny.fitnessProfile.fitnessGoal || 'Beginner Strength Training';
        reply = `Your current workout plan is **${goal}**. You can open the **Workout Plans** section to view the complete exercises and schedule.`;
      } else {
        reply = "Your current workout plan is **Beginner Strength Training**. You can open the **Workout Plans** section to view the complete exercises and schedule.";
      }
    }
    // Intent 6: Progress & Weight
    else if (q.includes('progress') || q.includes('how is my progress') || q.includes('weight') || q.includes('body analytics')) {
      if (progressLogs && progressLogs.length > 0) {
        const latest = progressLogs[0] as any;
        reply = `Your latest recorded weight is **${latest.weight || userAny.weight || 70} kg**. Target Weight: **${userAny.targetWeight || 65} kg**. You can view full body analytics on the **Progress** page.`;
      } else if (userAny.weight) {
        reply = `Your current recorded weight is **${userAny.weight} kg** (Target: **${userAny.targetWeight || 'N/A'} kg**). Height: **${userAny.height || 'N/A'} cm**. Visit the **Progress** page to track new logs.`;
      } else {
        reply = "Your fitness progress is tracked under the **Progress** section. Log your daily weight and body metrics to see your progress chart!";
      }
    }
    // Intent 7: Attendance
    else if (q.includes('attendance') || q.includes('check in') || q.includes('present') || q.includes('gym visits')) {
      reply = "You can view your monthly check-ins and attendance records under the **Attendance** section.";
    }
    // Intent 8: Subscription & Membership
    else if (q.includes('subscription') || q.includes('membership') || q.includes('my plan') || q.includes('expiry') || q.includes('renew')) {
      const plan = userAny.subscriptionPlan || 'Member';
      const status = userAny.subscriptionStatus || 'Active';
      reply = `Your current subscription plan is **${plan}** (Status: **${status}**). ${userAny.subscriptionExpiry ? `Expires on **${formatDateStr(userAny.subscriptionExpiry)}**.` : ''}`;
    }
    // Intent 9: Store & Orders
    else if (q.includes('order') || q.includes('store') || q.includes('purchased') || q.includes('cart')) {
      if (orders && orders.length > 0) {
        const latest = orders[0] as any;
        reply = `You have **${orders.length}** store order(s). Your latest order **#${latest.orderId || latest._id.toString().slice(-6).toUpperCase()}** is **${latest.status}** for **₹${latest.totalAmount}**.`;
      } else {
        reply = "You have no store orders yet. Browse supplements and fitness gear in the **Gym Store**!";
      }
    }
    // Intent 10: Profile & Notifications
    else if (q.includes('profile') || q.includes('my info') || q.includes('notification')) {
      if (q.includes('notification')) {
        reply = notifications.length > 0 ? `You have **${notifications.length}** unread notification(s). Check **Notifications** to read them.` : "You have no unread notifications.";
      } else {
        reply = `Your profile name is **${userAny.firstName} ${userAny.lastName || ''}**, registered email is **${userAny.email}**, and phone is **${userAny.mobile || 'Not set'}**.`;
      }
    }
    // Intent 11: General Fitness Guidance
    else if (q.includes('stamina') || q.includes('endurance')) {
      reply = "To improve stamina, combine regular cardio with strength training, gradually increase workout duration, stay hydrated, and maintain proper recovery.";
    }
    else if (q.includes('lose weight') || q.includes('fat loss') || q.includes('burn fat')) {
      reply = "To lose weight sustainably, maintain a caloric deficit, eat high-protein meals, do 3-4 days of resistance training plus cardio, and stay consistent.";
    }
    else if (q.includes('build muscle') || q.includes('gain muscle') || q.includes('hypertrophy')) {
      reply = "To build muscle, focus on progressive overload in strength exercises, eat a high-protein diet (1.6g-2g per kg), and get 7-9 hours of sleep for muscle repair.";
    }
    else if (q.includes('protein') || q.includes('diet') || q.includes('nutrition')) {
      reply = "A healthy fitness diet includes lean proteins (chicken, eggs, paneer, fish, legumes), complex carbs (oats, brown rice), healthy fats, and lots of water.";
    }
    else if (q.includes('recovery') || q.includes('sore') || q.includes('rest')) {
      reply = "For optimal muscle recovery, prioritize 7-9 hours of sleep, consume protein post-workout, drink plenty of water, and dynamic stretch before training.";
    }
    // Intent 12: General Gym & System Questions
    else if (q.includes('gym') || q.includes('facility') || q.includes('how to book') || q.includes('how to join')) {
      reply = "Our AI GYM offers state-of-the-art facilities, trainer booking, online Jitsi sessions, AI fitness plans, and progress tracking. You can book a trainer under **Find Trainers**!";
    }
    // Intent 13: Unsupported / Off-topic
    else {
      reply = "I am your AI Gym Assistant. I can assist you with gym services, fitness advice, trainer bookings, session schedules, workout plans, progress tracking, payments, store orders, and customer account-related topics. How can I help you today?";
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
