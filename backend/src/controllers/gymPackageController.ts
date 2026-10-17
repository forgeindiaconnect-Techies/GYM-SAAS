import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import GymPackage, { FITNESS_GOALS } from '../models/GymPackage';
import User from '../models/User';
import Gym from '../models/Gym';

// ─────────────────────────────────────────────────────────────────────────────
// Helper – find the gym owned by the authenticated user
// ─────────────────────────────────────────────────────────────────────────────
const getOwnerGymId = async (userId: string): Promise<string | null> => {
  const user = await User.findById(userId).select('gymId').lean();
  if (user?.gymId) return user.gymId.toString();

  // Fallback: look up by ownerId
  const gym = await Gym.findOne({ ownerId: userId }).select('_id').lean();
  return gym ? (gym._id as any).toString() : null;
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/gym-packages  (Gym Owner / Admin – packages)
// ─────────────────────────────────────────────────────────────────────────────
export const getMyGymPackages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) { res.status(401).json({ success: false, message: 'Unauthorized' }); return; }

    const isSuperAdmin = req.user?.role === 'SUPER_ADMIN';
    let gymId = req.query.gymId as string;
    if (!gymId) {
      gymId = (await getOwnerGymId(userId)) as string;
    }
    if (!gymId && !isSuperAdmin) { res.status(404).json({ success: false, message: 'No gym found for this owner' }); return; }

    const { status, fitnessGoal } = req.query;
    const filter: any = {};
    if (gymId) filter.gymId = gymId;
    if (status) filter.status = status;
    if (fitnessGoal) filter.fitnessGoal = fitnessGoal;

    const packages = await GymPackage.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, packages });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/gym-packages/public?gymId=&fitnessGoal=  (Public – customer view)
// ─────────────────────────────────────────────────────────────────────────────
export const getPublicGymPackages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { gymId, fitnessGoal } = req.query;

    const filter: any = { status: 'Active' };
    if (gymId) filter.gymId = gymId;
    if (fitnessGoal) filter.fitnessGoal = fitnessGoal;

    const packages = await GymPackage.find(filter).sort({ isPopular: -1, createdAt: -1 });
    res.status(200).json({ success: true, packages });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/gym-packages/:id  (single package)
// ─────────────────────────────────────────────────────────────────────────────
export const getGymPackageById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const pkg = await GymPackage.findById(req.params.id);
    if (!pkg) { res.status(404).json({ success: false, message: 'Package not found' }); return; }
    res.status(200).json({ success: true, package: pkg });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/gym-packages  (Gym Owner / Admin – create)
// ─────────────────────────────────────────────────────────────────────────────
export const createGymPackage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) { res.status(401).json({ success: false, message: 'Unauthorized' }); return; }

    const isSuperAdmin = req.user?.role === 'SUPER_ADMIN';
    let gymId = req.body.gymId;
    if (!gymId || !isSuperAdmin) {
      gymId = await getOwnerGymId(userId);
    }
    if (!gymId) { res.status(404).json({ success: false, message: 'No gym found for this owner / request' }); return; }

    const {
      name, fitnessGoal, description, features, benefits,
      trainingType, duration, monthlyPrice, annualPrice, availablePlans, isPopular, status
    } = req.body;

    // Validation
    if (!name?.trim()) { res.status(400).json({ success: false, message: 'Package name is required' }); return; }
    if (!fitnessGoal || !FITNESS_GOALS.includes(fitnessGoal)) {
      res.status(400).json({ success: false, message: `fitnessGoal must be one of: ${FITNESS_GOALS.join(', ')}` }); return;
    }
    if (monthlyPrice === undefined || monthlyPrice === null || isNaN(Number(monthlyPrice)) || Number(monthlyPrice) < 0) {
      res.status(400).json({ success: false, message: 'monthlyPrice must be a non-negative number' }); return;
    }
    if (annualPrice === undefined || annualPrice === null || isNaN(Number(annualPrice)) || Number(annualPrice) < 0) {
      res.status(400).json({ success: false, message: 'annualPrice must be a non-negative number' }); return;
    }

    // If setting as popular, unset others in same goal (optional UX choice)
    if (isPopular) {
      await GymPackage.updateMany({ gymId, fitnessGoal }, { $set: { isPopular: false } });
    }

    const pkg = new GymPackage({
      gymId,
      name: name.trim(),
      fitnessGoal,
      description: description?.trim(),
      features: Array.isArray(features) ? features.filter(Boolean) : [],
      benefits: Array.isArray(benefits) ? benefits.filter(Boolean) : [],
      trainingType: trainingType || 'Offline',
      duration: duration || '1 Month',
      monthlyPrice: Number(monthlyPrice),
      annualPrice: Number(annualPrice),
      availablePlans: availablePlans || 'both',
      isPopular: !!isPopular,
      status: status || 'Active',
    });

    await pkg.save();
    res.status(201).json({ success: true, message: 'Package created successfully', package: pkg });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/gym-packages/:id  (Gym Owner / Admin – update)
// ─────────────────────────────────────────────────────────────────────────────
export const updateGymPackage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) { res.status(401).json({ success: false, message: 'Unauthorized' }); return; }

    const isSuperAdmin = req.user?.role === 'SUPER_ADMIN';
    const pkg = await GymPackage.findById(req.params.id);
    if (!pkg) { res.status(404).json({ success: false, message: 'Package not found' }); return; }

    if (!isSuperAdmin) {
      const gymId = await getOwnerGymId(userId);
      if (!gymId || pkg.gymId.toString() !== gymId) {
        res.status(403).json({ success: false, message: 'Forbidden: this package does not belong to your gym' }); return;
      }
    }

    const {
      name, fitnessGoal, description, features, benefits,
      trainingType, duration, monthlyPrice, annualPrice, availablePlans, isPopular, status
    } = req.body;

    // Validate prices if provided
    if (monthlyPrice !== undefined && (isNaN(Number(monthlyPrice)) || Number(monthlyPrice) < 0)) {
      res.status(400).json({ success: false, message: 'monthlyPrice must be a non-negative number' }); return;
    }
    if (annualPrice !== undefined && (isNaN(Number(annualPrice)) || Number(annualPrice) < 0)) {
      res.status(400).json({ success: false, message: 'annualPrice must be a non-negative number' }); return;
    }
    if (fitnessGoal && !FITNESS_GOALS.includes(fitnessGoal)) {
      res.status(400).json({ success: false, message: `fitnessGoal must be one of: ${FITNESS_GOALS.join(', ')}` }); return;
    }

    if (isPopular) {
      const goalToUse = fitnessGoal || pkg.fitnessGoal;
      await GymPackage.updateMany({ gymId: pkg.gymId, fitnessGoal: goalToUse, _id: { $ne: pkg._id } }, { $set: { isPopular: false } });
    }

    if (name !== undefined) pkg.name = name.trim();
    if (fitnessGoal !== undefined) pkg.fitnessGoal = fitnessGoal;
    if (description !== undefined) pkg.description = description?.trim();
    if (features !== undefined) pkg.features = Array.isArray(features) ? features.filter(Boolean) : [];
    if (benefits !== undefined) pkg.benefits = Array.isArray(benefits) ? benefits.filter(Boolean) : [];
    if (trainingType !== undefined) pkg.trainingType = trainingType;
    if (duration !== undefined) pkg.duration = duration;
    if (monthlyPrice !== undefined) pkg.monthlyPrice = Number(monthlyPrice);
    if (annualPrice !== undefined) pkg.annualPrice = Number(annualPrice);
    if (availablePlans !== undefined) pkg.availablePlans = availablePlans;
    if (isPopular !== undefined) pkg.isPopular = !!isPopular;
    if (status !== undefined) pkg.status = status;

    await pkg.save();
    res.status(200).json({ success: true, message: 'Package updated successfully', package: pkg });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/gym-packages/:id/status  (Activate / Deactivate)
// ─────────────────────────────────────────────────────────────────────────────
export const toggleGymPackageStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) { res.status(401).json({ success: false, message: 'Unauthorized' }); return; }

    const isSuperAdmin = req.user?.role === 'SUPER_ADMIN';
    const pkg = await GymPackage.findById(req.params.id);
    if (!pkg) { res.status(404).json({ success: false, message: 'Package not found' }); return; }

    if (!isSuperAdmin) {
      const gymId = await getOwnerGymId(userId);
      if (!gymId || pkg.gymId.toString() !== gymId) {
        res.status(403).json({ success: false, message: 'Forbidden' }); return;
      }
    }

    const { status } = req.body;
    if (!['Active', 'Inactive'].includes(status)) {
      res.status(400).json({ success: false, message: 'status must be Active or Inactive' }); return;
    }

    pkg.status = status;
    await pkg.save();
    res.status(200).json({ success: true, message: `Package ${status.toLowerCase()}d successfully`, package: pkg });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/gym-packages/:id  (Gym Owner / Admin – delete)
// ─────────────────────────────────────────────────────────────────────────────
export const deleteGymPackage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) { res.status(401).json({ success: false, message: 'Unauthorized' }); return; }

    const isSuperAdmin = req.user?.role === 'SUPER_ADMIN';
    const pkg = await GymPackage.findById(req.params.id);
    if (!pkg) { res.status(404).json({ success: false, message: 'Package not found' }); return; }

    if (!isSuperAdmin) {
      const gymId = await getOwnerGymId(userId);
      if (!gymId || pkg.gymId.toString() !== gymId) {
        res.status(403).json({ success: false, message: 'Forbidden' }); return;
      }
    }

    await pkg.deleteOne();
    res.status(200).json({ success: true, message: 'Package deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/gym-packages/fitness-goals  – return the list of fitness goals
// ─────────────────────────────────────────────────────────────────────────────
export const getFitnessGoals = async (_req: AuthRequest, res: Response): Promise<void> => {
  res.status(200).json({ success: true, fitnessGoals: FITNESS_GOALS });
};
