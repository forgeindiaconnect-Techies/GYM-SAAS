import { Request, Response } from 'express';
import Exercise from '../models/Exercise';
import { AuthRequest } from '../middlewares/auth';
import { standardExercises } from '../utils/standardExercises';
import Gym from '../models/Gym';

// Helper to resolve gymId for current user
const resolveGymId = async (req: AuthRequest): Promise<string | undefined> => {
  if (req.user?.gymId) return req.user.gymId.toString();
  if (req.query.gymId) return req.query.gymId as string;
  const gym = await Gym.findOne().sort({ createdAt: -1 });
  return gym?._id?.toString();
};

// 1. Get Exercises (Gym Owner, Trainer, Customer)
export const getExercises = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const gymId = (await resolveGymId(req)) || req.user?.gymId;
    if (!gymId) {
      res.status(400).json({ success: false, message: 'Gym context required' });
      return;
    }

    const { category, targetMuscle, difficulty, status, search } = req.query;

    const query: any = { gymId };

    // Members only see active exercises; Gym Owners and Trainers can see all or filter by status
    if (req.user?.role === 'MEMBER') {
      query.status = 'Active';
    } else if (status && status !== 'all') {
      query.status = status;
    }

    if (category && category !== 'all') {
      query.category = new RegExp(`^${category}$`, 'i');
    }

    if (difficulty && difficulty !== 'all') {
      query.difficulty = difficulty;
    }

    if (targetMuscle && targetMuscle !== 'all') {
      query.targetMuscle = new RegExp(targetMuscle as string, 'i');
    }

    if (search && typeof search === 'string' && search.trim() !== '') {
      const s = search.trim();
      query.$or = [
        { name: new RegExp(s, 'i') },
        { category: new RegExp(s, 'i') },
        { targetMuscle: new RegExp(s, 'i') },
        { equipment: new RegExp(s, 'i') },
      ];
    }

    let exercises = await Exercise.find(query).sort({ category: 1, name: 1 });

    // If gym has 0 exercises and user is GYM_OWNER or ADMIN, auto-seed standard exercises
    if (exercises.length === 0 && !search && (!category || category === 'all') && (req.user?.role === 'GYM_OWNER' || req.user?.role === 'ADMIN')) {
      const seeded = standardExercises.map(ex => ({
        ...ex,
        gymId,
        gymOwnerId: req.user?.id
      })) as any[];
      exercises = (await Exercise.insertMany(seeded)) as any;
    }

    res.status(200).json({ success: true, count: exercises.length, exercises });
  } catch (error: any) {
    console.error('Error fetching exercises:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// 2. Get Single Exercise
export const getExerciseById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const exercise = await Exercise.findById(id);
    if (!exercise) {
      res.status(404).json({ success: false, message: 'Exercise not found' });
      return;
    }
    res.status(200).json({ success: true, exercise });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// 3. Create Exercise (Gym Owner)
export const createExercise = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user || !['GYM_OWNER', 'ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      res.status(403).json({ success: false, message: 'Only gym owners can add exercises' });
      return;
    }

    const gymId = (await resolveGymId(req)) || user.gymId;
    if (!gymId) {
      res.status(400).json({ success: false, message: 'Gym not found' });
      return;
    }

    const {
      name,
      category,
      targetMuscle,
      secondaryMuscle,
      difficulty,
      equipment,
      description,
      instructions,
      safetyInstructions,
      defaultDuration,
      defaultSets,
      defaultRepetitions,
      defaultRest,
      videoUrl,
      thumbnailUrl,
      animationType,
      status
    } = req.body;

    if (!name || !category || !targetMuscle) {
      res.status(400).json({ success: false, message: 'Name, Category, and Target Muscle are required' });
      return;
    }

    const exercise = new Exercise({
      gymId,
      gymOwnerId: user.id,
      name,
      category,
      targetMuscle,
      secondaryMuscle: secondaryMuscle || '',
      difficulty: difficulty || 'Beginner',
      equipment: equipment || 'No Equipment',
      description: description || '',
      instructions: instructions || '',
      safetyInstructions: safetyInstructions || '',
      defaultDuration: Number(defaultDuration) || 60,
      defaultSets: Number(defaultSets) || 3,
      defaultRepetitions: Number(defaultRepetitions) || 12,
      defaultRest: Number(defaultRest) || 30,
      videoUrl: videoUrl || '',
      thumbnailUrl: thumbnailUrl || '',
      animationType: animationType || 'video',
      status: status || 'Active'
    });

    await exercise.save();
    res.status(201).json({ success: true, message: 'Exercise created successfully', exercise });
  } catch (error: any) {
    console.error('Error creating exercise:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// 4. Update Exercise (Gym Owner)
export const updateExercise = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user || !['GYM_OWNER', 'ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      res.status(403).json({ success: false, message: 'Only gym owners can update exercises' });
      return;
    }

    const { id } = req.params;
    const gymId = (await resolveGymId(req)) || user.gymId;

    const exercise = await Exercise.findOne({ _id: id, gymId });
    if (!exercise) {
      res.status(404).json({ success: false, message: 'Exercise not found' });
      return;
    }

    const allowedFields = [
      'name', 'category', 'targetMuscle', 'secondaryMuscle',
      'difficulty', 'equipment', 'description', 'instructions',
      'safetyInstructions', 'defaultDuration', 'defaultSets',
      'defaultRepetitions', 'defaultRest', 'videoUrl', 'thumbnailUrl',
      'animationType', 'status'
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        if (['defaultDuration', 'defaultSets', 'defaultRepetitions', 'defaultRest'].includes(field)) {
          (exercise as any)[field] = Number(req.body[field]);
        } else {
          (exercise as any)[field] = req.body[field];
        }
      }
    });

    await exercise.save();
    res.status(200).json({ success: true, message: 'Exercise updated successfully', exercise });
  } catch (error: any) {
    console.error('Error updating exercise:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// 5. Delete Exercise (Gym Owner)
export const deleteExercise = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user || !['GYM_OWNER', 'ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      res.status(403).json({ success: false, message: 'Only gym owners can delete exercises' });
      return;
    }

    const { id } = req.params;
    const gymId = (await resolveGymId(req)) || user.gymId;

    const result = await Exercise.findOneAndDelete({ _id: id, gymId });
    if (!result) {
      res.status(404).json({ success: false, message: 'Exercise not found' });
      return;
    }

    res.status(200).json({ success: true, message: 'Exercise deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// 6. Toggle Status (Active / Inactive)
export const toggleExerciseStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user || !['GYM_OWNER', 'ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      res.status(403).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const gymId = (await resolveGymId(req)) || user.gymId;

    const exercise = await Exercise.findOne({ _id: id, gymId });
    if (!exercise) {
      res.status(404).json({ success: false, message: 'Exercise not found' });
      return;
    }

    exercise.status = exercise.status === 'Active' ? 'Inactive' : 'Active';
    await exercise.save();

    res.status(200).json({ success: true, message: `Exercise is now ${exercise.status}`, exercise });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// 7. Seed Standard Exercises (Gym Owner button)
export const seedStandardExercises = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user || !['GYM_OWNER', 'ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      res.status(403).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const gymId = (await resolveGymId(req)) || user.gymId;
    if (!gymId) {
      res.status(400).json({ success: false, message: 'Gym not found' });
      return;
    }

    // Insert only ones that don't already exist by name
    const existing = await Exercise.find({ gymId }).select('name');
    const existingNames = new Set(existing.map(e => e.name.toLowerCase()));

    const toInsert = standardExercises
      .filter(ex => !existingNames.has(ex.name.toLowerCase()))
      .map(ex => ({
        ...ex,
        gymId,
        gymOwnerId: user.id
      }));

    if (toInsert.length > 0) {
      await Exercise.insertMany(toInsert);
    }

    const total = await Exercise.countDocuments({ gymId });
    res.status(200).json({ 
      success: true, 
      message: `Standard exercises loaded! Added ${toInsert.length} new exercises.`,
      addedCount: toInsert.length,
      totalCount: total
    });
  } catch (error: any) {
    console.error('Error seeding exercises:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// 8. Upload Exercise Media (Video or Thumbnail)
export const uploadExerciseMedia = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No file uploaded' });
      return;
    }

    const fileUrl = `/uploads/exercises/${req.file.filename}`;
    const isVideo = req.file.mimetype.startsWith('video/');

    res.status(200).json({
      success: true,
      fileUrl,
      isVideo,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size
    });
  } catch (error: any) {
    console.error('Error uploading exercise media:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
