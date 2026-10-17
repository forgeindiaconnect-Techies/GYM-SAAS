import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import Gym, { GymStatus } from '../models/Gym';
import User, { Role, ApprovalStatus } from '../models/User';
import Trainer from '../models/Trainer';
import TrainerSession from '../models/TrainerSession';
import { AuthRequest } from '../middlewares/auth';

export const createGym = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      name, gymType, logo, description, email, phone, website,
      address, city, state, pinCode,
      ownerFirstName, ownerLastName, ownerEmail, ownerPhone, createAdminAccount,
      subscriptionPlan, subscriptionStartDate, subscriptionEndDate, subscriptionStatus,
      status, memberCapacity, trainerCapacity, equipment
    } = req.body;

    if (!name || !gymType || !email || !phone || !address || !city || !state || !pinCode || !ownerFirstName || !ownerLastName || !ownerEmail || !ownerPhone || !subscriptionPlan || !subscriptionStartDate) {
      res.status(400).json({ success: false, message: 'Required fields missing', errorCode: 'MISSING_FIELDS' });
      return;
    }

    const existingGym = await Gym.findOne({ $or: [{ name }, { email }] });
    if (existingGym) {
      res.status(400).json({ success: false, message: 'Gym with this name or email already exists', errorCode: 'GYM_EXISTS' });
      return;
    }

    // 1. Create or find owner
    let ownerId;
    let existingOwner = await User.findOne({ email: ownerEmail });
    
    if (existingOwner) {
      ownerId = existingOwner._id;
      // Optionally upgrade their role if they are just a member
      if (existingOwner.role === Role.MEMBER) {
        existingOwner.role = Role.GYM_OWNER;
        await existingOwner.save();
      }
    } else if (createAdminAccount) {
      const defaultPassword = 'WelcomeGymAdmin123!';
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(defaultPassword, salt);

      const newOwner = new User({
        firstName: ownerFirstName,
        lastName: ownerLastName,
        email: ownerEmail,
        mobile: ownerPhone,
        passwordHash,
        role: Role.GYM_OWNER,
        approvalStatus: ApprovalStatus.APPROVED,
        isActive: true
      });
      await newOwner.save();
      ownerId = newOwner._id;
    } else {
      // If we don't create an account, but the owner doesn't exist, this is an edge case
      // For now, we enforce creating an account or using an existing one.
      res.status(400).json({ success: false, message: 'Admin account must be created for a new gym if they do not exist.', errorCode: 'ADMIN_REQUIRED' });
      return;
    }

    // 2. Create the Gym
    const gym = new Gym({
      ownerId,
      name,
      gymType,
      logo,
      description,
      email,
      phone,
      website,
      subscription: {
        plan: subscriptionPlan,
        startDate: subscriptionStartDate,
        endDate: subscriptionEndDate,
        status: subscriptionStatus || 'Active'
      },
      location: {
        address,
        city,
        state,
        pinCode
      },
      memberCapacity,
      trainerCapacity,
      equipment,
      status: status || GymStatus.PENDING
    });

    await gym.save();

    // 3. Update the owner to reference this gym
    await User.findByIdAndUpdate(ownerId, { gymId: gym._id });

    res.status(201).json({
      success: true,
      message: 'Gym created successfully.',
      gym
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const getGyms = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.query;
    let filter: any = {};
    if (status) {
      filter.status = status;
    } else {
      filter.status = { $ne: 'DELETED' };
    }
    const gyms = await Gym.find(filter).populate('ownerId', 'firstName lastName email mobile').sort({ createdAt: -1 });
    res.status(200).json({ success: true, gyms });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const getGymById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const gym = await Gym.findById(id).populate('ownerId', 'firstName lastName email mobile');
    if (!gym) {
      res.status(404).json({ success: false, message: 'Gym not found' });
      return;
    }
    res.status(200).json({ success: true, gym });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const getMyGym = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?._id || (req as any).user?.id;
    const userGymId = (req as any).user?.gymId;

    let targetGymId = userGymId;
    if (!targetGymId && userId) {
      const userDoc = await User.findById(userId);
      if (userDoc?.gymId) {
        targetGymId = userDoc.gymId;
      }
    }
    if (!targetGymId && userId) {
      const CustomerMembership = require('../models/CustomerMembership').default;
      const membership = await CustomerMembership.findOne({ customerId: userId }).sort({ createdAt: -1 });
      if (membership?.gymId) {
        targetGymId = membership.gymId;
      }
    }

    let gym;
    if (targetGymId) {
      gym = await Gym.findById(targetGymId).populate('ownerId', 'firstName lastName email mobile');
    }
    if (!gym && userId) {
      gym = await Gym.findOne({ ownerId: userId }).populate('ownerId', 'firstName lastName email mobile');
    }
    if (!gym) {
      gym = await Gym.findOne({ status: GymStatus.ACTIVE } as any).populate('ownerId', 'firstName lastName email mobile');
    }

    if (!gym) {
      res.status(404).json({ success: false, message: 'No gym assigned to this user' });
      return;
    }

    res.status(200).json({ success: true, gym });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const updateGymStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;
    
    if (!Object.values(GymStatus).includes(status)) {
      res.status(400).json({ success: false, message: 'Invalid status' });
      return;
    }

    const gym = await Gym.findByIdAndUpdate(id, { status }, { new: true });
    if (!gym) {
      res.status(404).json({ success: false, message: 'Gym not found' });
      return;
    }

    const owner = await User.findById(gym.ownerId);
    if (owner) {
      owner.approvalStatus = status as any;
      if (status === 'REJECTED') {
        owner.rejectionReason = reason;
        owner.isActive = false;
      } else if (status === 'SUSPENDED') {
        (owner as any).suspensionReason = reason;
        owner.isActive = false;
      } else if (status === 'APPROVED') {
        owner.isActive = true;
        owner.rejectionReason = undefined;
        (owner as any).suspensionReason = undefined;
        // Require package plan payment before dashboard access
        if (String(owner.subscriptionStatus).toUpperCase() !== 'ACTIVE') {
          owner.subscriptionStatus = 'NONE' as any;
          owner.paymentStatus = 'Pending Verification' as any;
          owner.subscriptionExpiry = undefined;
        }
      }
      await owner.save();
    }

    res.status(200).json({ success: true, message: 'Gym status updated', gym });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const updateGym = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      name, gymType, logo, description, email, phone, website,
      address, city, state, pinCode,
      subscriptionPlan, subscriptionStartDate, subscriptionEndDate, subscriptionStatus,
      status, memberCapacity, trainerCapacity, equipment, subscriptionPlans
    } = req.body;

    const gym = await Gym.findById(id);
    if (!gym) {
      res.status(404).json({ success: false, message: 'Gym not found' });
      return;
    }

    const updateData: any = {};
    if (name) updateData.name = name;
    if (gymType) updateData.gymType = gymType;
    if (logo !== undefined) updateData.logo = logo;
    if (description !== undefined) updateData.description = description;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (website !== undefined) updateData.website = website;
    if (memberCapacity !== undefined) updateData.memberCapacity = memberCapacity;
    if (trainerCapacity !== undefined) updateData.trainerCapacity = trainerCapacity;
    if (equipment) updateData.equipment = equipment;
    if (status) updateData.status = status;
    if (subscriptionPlans) updateData.subscriptionPlans = subscriptionPlans;

    if (address || city || state || pinCode) {
      updateData.location = {
        address: address || gym.location?.address,
        city: city || gym.location?.city,
        state: state || gym.location?.state,
        pinCode: pinCode || gym.location?.pinCode,
      };
    }

    if (subscriptionPlan || subscriptionStartDate || subscriptionEndDate || subscriptionStatus) {
      updateData.subscription = {
        plan: subscriptionPlan || gym.subscription?.plan,
        startDate: subscriptionStartDate || gym.subscription?.startDate,
        endDate: subscriptionEndDate || gym.subscription?.endDate,
        status: subscriptionStatus || gym.subscription?.status || 'Active',
      };
    }

    const updatedGym = await Gym.findByIdAndUpdate(id, { $set: updateData }, { new: true });

    res.status(200).json({ success: true, message: 'Gym updated successfully', gym: updatedGym });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const deleteGym = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const gym = await Gym.findByIdAndUpdate(id, { status: 'DELETED' }, { new: true });
    if (!gym) {
      res.status(404).json({ success: false, message: 'Gym not found' });
      return;
    }
    
    // Note: If you want to unlink the owner on delete, uncomment the next line
    // await User.findByIdAndUpdate(gym.ownerId, { $unset: { gymId: 1 } });
    
    res.status(200).json({ success: true, message: 'Gym deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const getPublicGyms = async (req: Request, res: Response): Promise<void> => {
  try {
    const { city, pinCode, search, gymType } = req.query;
    // Show gyms that are ACTIVE, APPROVED, Active, or PENDING (for testing)
    let filter: any = { status: { $in: ['ACTIVE', 'APPROVED', 'Active', 'PENDING', 'Pending'] } };
    
    if (city) filter['location.city'] = { $regex: new RegExp(city as string, 'i') };
    if (pinCode) filter['location.pinCode'] = pinCode;
    if (gymType) filter.gymType = gymType;
    if (search) {
      const searchRegex = new RegExp(search as string, 'i');
      filter.$or = [
        { name: searchRegex },
        { 'location.city': searchRegex },
        { 'location.area': searchRegex },
        { 'location.state': searchRegex },
        { 'location.pinCode': searchRegex },
        { gymType: searchRegex },
      ];
    }

    const gyms = await Gym.find(filter).select('-subscription').sort({ createdAt: -1 }).lean();
    
    // Fetch branches for these gyms
    const mongoose = require('mongoose');
    const Branch = mongoose.model('Branch');
    const gymIds = gyms.map(g => g._id);
    const branches = await Branch.find({ gymId: { $in: gymIds }, status: 'ACTIVE' }).lean();
    
    // Attach branches to gyms
    const gymsWithBranches = gyms.map(gym => ({
      ...gym,
      branches: branches.filter((b: any) => b.gymId.toString() === gym._id.toString())
    }));

    res.status(200).json({ success: true, gyms: gymsWithBranches });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

import Branch from '../models/Branch';

export const getPublicGymById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const gym = await Gym.findById(id).select('-subscription').populate('ownerId', 'firstName lastName email mobile subscriptionPlan');
    if (!gym || (gym.status !== GymStatus.ACTIVE && (gym.status as string) !== 'APPROVED')) {
      res.status(404).json({ success: false, message: 'Gym not found or not active' });
      return;
    }
    
    // Fetch trainer profiles from Trainer model
    const trainerProfiles = await Trainer.find({
      $or: [
        { gymId: gym._id },
        { gymId: gym._id.toString() }
      ]
    }).lean();

    // Also fetch trainers from User model
    const userTrainers = await User.find({
      $or: [
        { gymId: gym._id.toString(), role: 'TRAINER' },
        { gymId: gym._id, role: 'TRAINER' }
      ],
      isActive: true
    } as any).select('firstName lastName specialization experienceYears profilePhoto bio').lean();

    // Unify trainers
    const unifiedTrainersMap = new Map<string, any>();
    trainerProfiles.forEach((tp: any) => {
      const idKey = tp._id.toString();
      unifiedTrainersMap.set(idKey, {
        _id: tp._id,
        userId: tp.userId,
        name: tp.name || 'Trainer',
        firstName: tp.name ? tp.name.split(' ')[0] : 'Trainer',
        lastName: tp.name ? tp.name.split(' ').slice(1).join(' ') : '',
        specialization: tp.specialization || 'Fitness Coach',
        experienceYears: tp.experience || 1,
        profilePhoto: tp.profilePhoto || '',
        bio: tp.bio || '',
        averageRating: tp.averageRating || 5,
        totalReviews: tp.totalReviews || 0
      });
    });

    userTrainers.forEach((ut: any) => {
      const matchInProfiles = trainerProfiles.find((tp: any) => tp.userId?.toString() === ut._id.toString() || tp.email?.toLowerCase() === ut.email?.toLowerCase());
      if (!matchInProfiles) {
        unifiedTrainersMap.set(ut._id.toString(), {
          _id: ut._id,
          userId: ut._id,
          name: `${ut.firstName || ''} ${ut.lastName || ''}`.trim() || 'Trainer',
          firstName: ut.firstName || 'Trainer',
          lastName: ut.lastName || '',
          specialization: ut.specialization || 'Fitness Coach',
          experienceYears: ut.experienceYears || 1,
          profilePhoto: ut.profilePhoto || '',
          bio: ut.bio || '',
          averageRating: 5,
          totalReviews: 0
        });
      }
    });

    const unifiedTrainers = Array.from(unifiedTrainersMap.values());

    // Fetch branches for this gym
    const branches = await Branch.find({ gymId: gym._id, status: 'ACTIVE' } as any);

    // Fetch customer reviews from TrainerSession
    const allTrainerIds = trainerProfiles.map((t: any) => t._id);
    const allUserIds = trainerProfiles.map((t: any) => t.userId).filter(Boolean);
    const allIdsToMatch = [...allTrainerIds, ...allUserIds, ...userTrainers.map((u: any) => u._id)];

    const sessionReviews = await TrainerSession.find({
      $or: [
        { gymId: gym._id },
        { gymId: gym._id.toString() },
        { trainerId: { $in: allIdsToMatch } }
      ],
      customerRating: { $exists: true, $gt: 0 }
    })
      .populate('customerId', 'firstName lastName email profilePhoto')
      .populate('trainerId', 'name email specialization profilePhoto experience')
      .sort({ updatedAt: -1 })
      .lean();

    const mappedSessionReviews = sessionReviews.map((sess: any) => {
      const cust = sess.customerId;
      const custName = cust ? `${cust.firstName || ''} ${cust.lastName || ''}`.trim() : 'Verified Member';
      const tr = sess.trainerId;
      const trName = tr?.name || (tr?.firstName ? `${tr.firstName} ${tr.lastName}` : (unifiedTrainers[0]?.name || 'Certified Trainer'));
      const trSpec = tr?.specialization || unifiedTrainers.find((t: any) => t.name === trName)?.specialization || 'Fitness Coach';

      return {
        _id: sess._id.toString(),
        userId: cust?._id,
        userName: custName || 'Verified Member',
        userPhoto: cust?.profilePhoto || '',
        rating: Number(sess.customerRating) || 5,
        review: sess.customerReview || 'Good training experience',
        type: 'trainer' as const,
        trainerName: trName,
        trainerSpecialization: trSpec,
        mode: sess.mode,
        bookingId: sess.bookingId,
        createdAt: sess.updatedAt || sess.createdAt || sess.date
      };
    });

    const directReviews = ((gym as any).reviews || []).map((r: any) => ({
      _id: r._id?.toString() || Math.random().toString(),
      userId: r.userId,
      userName: r.userName || 'Verified Member',
      userPhoto: r.userPhoto || '',
      rating: Number(r.rating) || 5,
      review: r.review,
      type: (r.type || 'gym') as 'gym' | 'trainer',
      trainerName: r.trainerName || '',
      createdAt: r.createdAt
    }));

    const allReviews = [...mappedSessionReviews, ...directReviews].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const totalReviews = allReviews.length;
    const sumRatings = allReviews.reduce((sum, r) => sum + (Number(r.rating) || 5), 0);
    const averageRating = totalReviews > 0 ? Number((sumRatings / totalReviews).toFixed(1)) : (gym.rating || 4.5);
    const ratingBreakdown = {
      5: allReviews.filter(r => Math.round(Number(r.rating)) === 5).length,
      4: allReviews.filter(r => Math.round(Number(r.rating)) === 4).length,
      3: allReviews.filter(r => Math.round(Number(r.rating)) === 3).length,
      2: allReviews.filter(r => Math.round(Number(r.rating)) === 2).length,
      1: allReviews.filter(r => Math.round(Number(r.rating)) === 1).length,
    };

    const gymData = gym.toObject();
    gymData.rating = averageRating;
    gymData.reviewCount = totalReviews;

    res.status(200).json({ 
      success: true, 
      gym: gymData, 
      trainers: unifiedTrainers, 
      branches,
      reviews: allReviews,
      ratingStats: {
        averageRating,
        totalReviews,
        ratingBreakdown
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const addGymReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { rating, review, type, trainerName } = req.body;
    
    if (!rating || !review) {
      res.status(400).json({ success: false, message: 'Rating and review message are required' });
      return;
    }

    const user = await User.findById(req.user?.id);
    if (!user) {
      res.status(401).json({ success: false, message: 'User not found' });
      return;
    }

    const gym = await Gym.findById(id);
    if (!gym) {
      res.status(404).json({ success: false, message: 'Gym not found' });
      return;
    }

    const newReview = {
      userId: user._id,
      userName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Verified Member',
      userPhoto: user.profilePhoto || '',
      rating: Math.min(5, Math.max(1, Number(rating))),
      review: review.trim(),
      type: (type === 'trainer' ? 'trainer' : 'gym') as 'gym' | 'trainer',
      trainerName: trainerName?.trim() || '',
      createdAt: new Date()
    };

    const userIdStr = (user._id || '').toString();
    const existingReviews = (gym.reviews || []).filter((r: any) => 
      !r.userId || r.userId.toString() !== userIdStr
    );
    const updatedReviews = [newReview, ...existingReviews];

    // Update gym rating summary
    const totalReviews = updatedReviews.length;
    const sumRatings = updatedReviews.reduce((sum: number, r: any) => sum + (Number(r.rating) || 5), 0);
    const newRating = totalReviews > 0 ? Number((sumRatings / totalReviews).toFixed(1)) : 5.0;

    await Gym.updateOne(
      { _id: gym._id },
      {
        $set: {
          reviews: updatedReviews,
          rating: newRating,
          reviewCount: totalReviews
        }
      }
    );

    res.status(200).json({
      success: true,
      message: 'Review submitted successfully',
      review: newReview,
      gymRating: newRating,
      reviewCount: totalReviews
    });
  } catch (error: any) {
    console.error('addGymReview error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error', error: error.message });
  }
};

export const updatePaymentSettings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { paymentSettings } = req.body;
    
    const gym = await Gym.findById(id);
    if (!gym) {
      res.status(404).json({ success: false, message: 'Gym not found' });
      return;
    }

    // Authorization: Only the owner or an admin can update these
    if (req.user?.role !== 'SUPER_ADMIN' && gym.ownerId.toString() !== req.user?.id) {
       res.status(403).json({ success: false, message: 'Unauthorized' });
       return;
    }

    gym.paymentSettings = { ...gym.paymentSettings, ...paymentSettings };
    await gym.save();

    res.status(200).json({ success: true, message: 'Payment settings updated successfully', gym });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const getCommunityTestimonials = async (req: Request, res: Response): Promise<void> => {
  try {
    // 1. Fetch real Gym Owners
    const owners = await User.find({ role: Role.GYM_OWNER, isActive: { $ne: false } })
      .select('firstName lastName email profilePhoto gymId createdAt')
      .sort({ createdAt: -1 })
      .lean();

    const ownerIds = owners.map(o => o._id);
    const gymList = await Gym.find({
      $or: [
        { ownerId: { $in: ownerIds } },
        { _id: { $in: owners.map(o => o.gymId).filter(Boolean) } }
      ]
    }).select('name ownerId rating reviewCount').lean();

    const gymMap = new Map<string, any>();
    gymList.forEach(g => {
      if (g.ownerId) gymMap.set(g.ownerId.toString(), g);
      gymMap.set(g._id.toString(), g);
    });

    const ownerQuotes = [
      'Since listing our gym on Gymora, our member acquisition has tripled. The management dashboard and branch analytics are incredibly intuitive.',
      'The automated billing and digital check-ins freed up hours of administrative time every single day. The best gym management platform we have used.',
      'Managing trainer schedules, equipment maintenance, and member subscriptions has become effortless. Revenue grew by 45% in our first quarter.'
    ];

    // Filter out owners whose comments/testimonials should be removed (Agila and Renugopal)
    const activeOwnersWithTestimonials = owners.filter(owner => {
      const email = (owner.email || '').toLowerCase();
      const fullName = `${owner.firstName || ''} ${owner.lastName || ''}`.trim().toLowerCase();
      if (email.includes('agila') || fullName.includes('agila')) return false;
      if (email.includes('renugopal') || fullName.includes('renugopal')) return false;
      return true;
    });

    const ownerTestimonials = activeOwnersWithTestimonials.map((owner, idx) => {
      const gym = gymMap.get(owner._id.toString()) || (owner.gymId ? gymMap.get(owner.gymId.toString()) : null);
      let gymName = gym?.name || 'Perfect Fitness Studio';
      const name = `${owner.firstName || ''} ${owner.lastName || ''}`.replace(/\s+/g, ' ').trim() || 'Arun FIC';
      if (name.toLowerCase().includes('arun')) {
        gymName = 'Perfect Fitness Studio';
      }
      return {
        id: `owner-${owner._id}`,
        userId: owner._id,
        name,
        role: gymName ? `GYM OWNER • ${gymName.toUpperCase()}` : 'GYM OWNER',
        category: 'Gym Owner',
        type: 'owner',
        gymName,
        rating: gym?.rating || 5,
        text: ownerQuotes[idx % ownerQuotes.length].replace('our gym', gymName)
      };
    });

    // 2. Fetch real Trainers and real Customer Reviews given to Trainers
    const trainers = await User.find({ role: Role.TRAINER, isActive: { $ne: false } })
      .select('firstName lastName email profilePhoto specialization experienceYears bio createdAt')
      .sort({ createdAt: -1 })
      .lean();

    const trainerProfiles = await Trainer.find().select('name email specialization experience averageRating userId').lean();
    const trainerMetaMap = new Map<string, any>();
    trainerProfiles.forEach(t => {
      if (t.email) trainerMetaMap.set(t.email.toLowerCase(), t);
      if (t.name) trainerMetaMap.set(t.name.toLowerCase(), t);
      if (t.userId) trainerMetaMap.set(t.userId.toString(), t);
      trainerMetaMap.set(t._id.toString(), t);
    });

    // Fetch actual customer reviews given to trainers from TrainerSession
    const reviewedSessions = await TrainerSession.find({
      $or: [
        { customerReview: { $exists: true, $ne: '' } },
        { customerRating: { $exists: true, $gt: 0 } }
      ]
    })
      .populate('customerId', 'firstName lastName email profilePhoto')
      .populate('trainerId', 'name email specialization experience averageRating userId')
      .sort({ updatedAt: -1 })
      .lean();

    const trainerQuotes = [
      'As a trainer, this platform helps me manage all my clients efficiently. The AI handles the baseline workouts while I focus on form, technique, and motivation.',
      'The real-time client feedback and AI workout analytics allow me to deliver personalized training programs at scale without burnout.',
      'The automated progress tracking and diet suggestions make it simple for clients to stay consistent and hit their PRs faster.',
      'Streamlined scheduling and direct messaging make daily sessions effortless. Client retention has increased dramatically.'
    ];

    const trainerTestimonials: any[] = [];
    const reviewedTrainerKeys = new Set<string>();

    if (reviewedSessions && reviewedSessions.length > 0) {
      reviewedSessions.forEach((sess: any) => {
        const tr = sess.trainerId;
        const cust = sess.customerId;
        const custName = cust ? `${cust.firstName || ''} ${cust.lastName || ''}`.trim() : 'Verified Member';

        // Find matching trainer user or profile
        const trUser = trainers.find(t =>
          (tr && tr.userId && t._id.toString() === tr.userId.toString()) ||
          (tr && tr._id && t._id.toString() === tr._id.toString()) ||
          (tr && tr.email && t.email && t.email.toLowerCase() === tr.email.toLowerCase()) ||
          (tr && tr.name && `${t.firstName || ''} ${t.lastName || ''}`.trim().toLowerCase() === tr.name.toLowerCase())
        );

        const trainerName = tr?.name || (trUser ? `${trUser.firstName || ''} ${trUser.lastName || ''}`.trim() : 'Certified Trainer');
        const spec = tr?.specialization || trUser?.specialization || 'ALL';
        const rating = sess.customerRating || tr?.averageRating || 5;
        const text = (sess.customerReview && sess.customerReview.trim()) ? sess.customerReview.trim() : 'Outstanding personal training session. Great motivation and coaching!';

        if (tr?._id) reviewedTrainerKeys.add(tr._id.toString());
        if (trUser?._id) reviewedTrainerKeys.add(trUser._id.toString());
        if (tr?.email) reviewedTrainerKeys.add(tr.email.toLowerCase());
        if (trainerName) reviewedTrainerKeys.add(trainerName.toLowerCase());

        trainerTestimonials.push({
          id: `trainer-review-${sess._id}`,
          userId: trUser?._id || tr?.userId || tr?._id,
          name: trainerName,
          role: 'CERTIFIED TRAINER',
          subtitle: spec,
          reviewedBy: custName,
          category: 'Trainer',
          type: 'trainer',
          rating,
          text
        });
      });
    }

    // For any trainers without a customer review yet, provide their profile card
    trainers.forEach((tr, idx) => {
      const trName = `${tr.firstName || ''} ${tr.lastName || ''}`.trim();
      const meta = tr.email ? trainerMetaMap.get(tr.email.toLowerCase()) : null;
      if (
        reviewedTrainerKeys.has(tr._id.toString()) ||
        (meta && reviewedTrainerKeys.has(meta._id.toString())) ||
        (tr.email && reviewedTrainerKeys.has(tr.email.toLowerCase())) ||
        (trName && reviewedTrainerKeys.has(trName.toLowerCase()))
      ) {
        return;
      }

      const name = trName || meta?.name || 'Certified Trainer';
      const spec = tr.specialization || meta?.specialization || 'Fitness Coach';
      trainerTestimonials.push({
        id: `trainer-${tr._id}`,
        userId: tr._id,
        name,
        role: `CERTIFIED TRAINER`,
        subtitle: spec,
        category: 'Trainer',
        type: 'trainer',
        rating: meta?.averageRating || 5,
        text: tr.bio || trainerQuotes[idx % trainerQuotes.length]
      });
    });

    // 3. Fetch real Members and their actual Gym Reviews
    const members = await User.find({ role: Role.MEMBER, isActive: { $ne: false } })
      .select('firstName lastName email profilePhoto subscriptionPlan customerType createdAt')
      .sort({ createdAt: -1 })
      .lean();

    const memberMap = new Map<string, any>();
    members.forEach(m => {
      memberMap.set(m._id.toString(), m);
      if (m.email) memberMap.set(m.email.toLowerCase(), m);
      const fullName = `${m.firstName || ''} ${m.lastName || ''}`.trim().toLowerCase();
      if (fullName) memberMap.set(fullName, m);
    });

    // Fetch all gyms that have real member reviews
    const gymsWithReviews = await Gym.find({
      'reviews.0': { $exists: true }
    })
      .select('name location reviews rating reviewCount')
      .lean();

    const realMemberReviews: any[] = [];
    const reviewedMemberUserIds = new Set<string>();

    gymsWithReviews.forEach((gym: any) => {
      if (!Array.isArray(gym.reviews)) return;
      gym.reviews.forEach((r: any) => {
        if (!r.review || !r.review.trim()) return;

        const memberUser = r.userId
          ? memberMap.get(r.userId.toString())
          : (r.userName ? memberMap.get(r.userName.trim().toLowerCase()) : null);

        const userName = r.userName || (memberUser ? `${memberUser.firstName || ''} ${memberUser.lastName || ''}`.trim() : 'Verified Member');
        const planName = memberUser?.subscriptionPlan ? `${memberUser.subscriptionPlan.toUpperCase()} MEMBER` : 'STARTER MEMBER';
        const locParts = [gym.location?.city, gym.location?.state].filter(Boolean);
        const locStr = locParts.length > 0 ? ` • ${locParts.join(', ')}` : '';

        if (r.userId) reviewedMemberUserIds.add(r.userId.toString());
        if (memberUser?._id) reviewedMemberUserIds.add(memberUser._id.toString());
        if (r.userName) reviewedMemberUserIds.add(r.userName.trim().toLowerCase());

        realMemberReviews.push({
          id: `member-gym-review-${gym._id}-${r._id || r.userId || Math.random()}`,
          userId: r.userId || memberUser?._id,
          name: userName,
          role: planName,
          category: 'Member',
          type: 'member',
          rating: Number(r.rating) || 5,
          text: r.review.trim(),
          gymName: gym.name,
          gymLocation: locParts.join(', '),
          subtitle: `Reviewed ${gym.name}${locStr}`,
          reviewedGym: gym.name,
          createdAt: r.createdAt ? new Date(r.createdAt) : new Date()
        });
      });
    });

    // Sort real gym reviews newest first
    realMemberReviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const memberQuotes = [
      'The AI workout plans adjusted exactly to my home equipment and schedule. I lost 15lbs in two months without feeling overworked.',
      'Having access to certified trainers combined with personalized AI routines on my phone completely changed my fitness journey.',
      'The nutrition guidance and dynamic calorie goals helped me gain clean muscle while keeping my energy high throughout the workday.',
      'No more guessing in the gym. Every set, rep, and recovery rest is calculated for maximum results.',
      'From QR code attendance to real-time progress charts, Gymora makes showing up at the gym an exciting daily habit.'
    ];

    const fallbackMemberTestimonials: any[] = [];
    members.forEach((mem, idx) => {
      const name = `${mem.firstName || ''} ${mem.lastName || ''}`.trim();
      if (
        reviewedMemberUserIds.has(mem._id.toString()) ||
        (name && reviewedMemberUserIds.has(name.toLowerCase()))
      ) {
        return; // Member already included via their actual gym review
      }

      const planName = mem.subscriptionPlan ? `${mem.subscriptionPlan.toUpperCase()} MEMBER` : 'PREMIUM MEMBER';
      fallbackMemberTestimonials.push({
        id: `member-${mem._id}`,
        userId: mem._id,
        name: name || 'Gym Member',
        role: planName,
        category: 'Member',
        type: 'member',
        rating: 5,
        text: memberQuotes[idx % memberQuotes.length]
      });
    });

    const memberTestimonials = [...realMemberReviews, ...fallbackMemberTestimonials];

    // Curate a balanced primary showcase: 1 Member, 1 Trainer, 1 Gym Owner (matching the 3-column landing UI)
    const featured: any[] = [];
    if (memberTestimonials.length > 0) featured.push(memberTestimonials[0]);
    if (trainerTestimonials.length > 0) featured.push(trainerTestimonials[0]);
    if (ownerTestimonials.length > 0) featured.push(ownerTestimonials[0]);

    // Fill up to 3 if any category was missing
    const remaining = [...memberTestimonials.slice(1), ...trainerTestimonials.slice(1), ...ownerTestimonials.slice(1)];
    while (featured.length < 3 && remaining.length > 0) {
      featured.push(remaining.shift());
    }

    res.status(200).json({
      success: true,
      counts: {
        members: memberTestimonials.length,
        trainers: trainerTestimonials.length,
        owners: ownerTestimonials.length,
        total: memberTestimonials.length + trainerTestimonials.length + ownerTestimonials.length
      },
      featured,
      all: [
        ...memberTestimonials,
        ...trainerTestimonials,
        ...ownerTestimonials
      ],
      members: memberTestimonials,
      trainers: trainerTestimonials,
      owners: ownerTestimonials
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const updateGymLocation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?._id || (req as any).user?.id;
    const userGymId = (req as any).user?.gymId;

    let gym;
    if (userGymId) {
      gym = await Gym.findById(userGymId);
    }
    if (!gym && userId) {
      gym = await Gym.findOne({ ownerId: userId });
    }

    if (!gym) {
      res.status(404).json({ success: false, message: 'No gym assigned to this user' });
      return;
    }

    const { address, area, city, state, country, pinCode, latitude, longitude } = req.body;

    if (!address || !city || !state || !pinCode) {
      res.status(400).json({ success: false, message: 'Address, City, State, and Pincode are required fields' });
      return;
    }

    const parsedLat = (latitude !== undefined && latitude !== null && latitude !== '') ? Number(latitude) : undefined;
    const parsedLng = (longitude !== undefined && longitude !== null && longitude !== '') ? Number(longitude) : undefined;

    gym.location = {
      address: String(address).trim(),
      area: area ? String(area).trim() : (gym.location?.area || ''),
      city: String(city).trim(),
      state: String(state).trim(),
      country: country ? String(country).trim() : (gym.location?.country || 'India'),
      pinCode: String(pinCode).trim(),
      latitude: parsedLat !== undefined && !isNaN(parsedLat) ? parsedLat : gym.location?.latitude,
      longitude: parsedLng !== undefined && !isNaN(parsedLng) ? parsedLng : gym.location?.longitude,
    };

    await gym.save();

    res.status(200).json({
      success: true,
      message: 'Gym location saved successfully',
      location: gym.location,
      gym
    });
  } catch (error: any) {
    console.error('updateGymLocation error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error updating location' });
  }
};

export const getGymOwnerReviews = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id || (req.user as any)?._id;
    const userGymId = (req.user as any)?.gymId;

    let targetGymId = userGymId;
    if (!targetGymId && userId) {
      const userDoc = await User.findById(userId);
      if (userDoc?.gymId) targetGymId = userDoc.gymId;
    }

    let gym: any = null;
    if (targetGymId) {
      gym = await Gym.findById(targetGymId);
    }
    if (!gym && userId) {
      gym = await Gym.findOne({ ownerId: userId });
    }
    if (!gym) {
      gym = await Gym.findOne({ status: GymStatus.ACTIVE });
    }

    if (!gym) {
      res.status(404).json({ success: false, message: 'Gym not found for this user' });
      return;
    }

    // 1. Customer reviews about the gym
    const rawGymReviews = (gym.reviews || []).filter((r: any) => r.type !== 'trainer');
    const gymReviews = rawGymReviews.map((r: any) => ({
      _id: r._id?.toString() || Math.random().toString(),
      userId: r.userId,
      userName: r.userName || 'Verified Member',
      userPhoto: r.userPhoto || '',
      rating: Number(r.rating) || 5,
      review: r.review || '',
      type: 'gym',
      gymName: gym.name,
      createdAt: r.createdAt || gym.createdAt
    })).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // 2. Customer reviews about trainers
    const gymTrainers = await Trainer.find({
      $or: [
        { gymId: gym._id },
        { gymId: gym._id.toString() }
      ]
    }).select('name email specialization experience profilePhoto averageRating userId').lean();

    const trainerIds = gymTrainers.map((t: any) => t._id);
    const trainerUserIds = gymTrainers.map((t: any) => t.userId).filter(Boolean);
    const allTrainerMatch = [...trainerIds, ...trainerUserIds];

    const sessionReviews = await TrainerSession.find({
      $or: [
        { gymId: gym._id },
        { gymId: gym._id.toString() },
        { trainerId: { $in: allTrainerMatch } }
      ],
      customerRating: { $exists: true, $gt: 0 }
    })
      .populate('customerId', 'firstName lastName email profilePhoto')
      .populate('trainerId', 'name email specialization profilePhoto experience')
      .sort({ updatedAt: -1, createdAt: -1 })
      .lean();

    const mappedTrainerSessionReviews = sessionReviews.map((sess: any) => {
      const cust = sess.customerId;
      const custName = cust ? `${cust.firstName || ''} ${cust.lastName || ''}`.trim() : 'Verified Member';
      const tr = sess.trainerId;
      const trName = tr?.name || (tr?.firstName ? `${tr.firstName} ${tr.lastName}` : (gymTrainers[0]?.name || 'Personal Trainer'));
      const trSpec = tr?.specialization || gymTrainers.find((t: any) => t.name === trName)?.specialization || 'Fitness Trainer';

      return {
        _id: sess._id.toString(),
        customerId: cust?._id,
        customerName: custName || 'Verified Member',
        customerPhoto: cust?.profilePhoto || '',
        customerEmail: cust?.email || '',
        trainerId: tr?._id || sess.trainerId,
        trainerName: trName,
        trainerPhoto: tr?.profilePhoto || '',
        trainerSpecialization: trSpec,
        rating: Number(sess.customerRating) || 5,
        review: sess.customerReview || 'Good training experience',
        sessionMode: sess.mode || 'In-Person',
        bookingId: sess.bookingId || '',
        sessionDate: sess.date || '',
        createdAt: sess.updatedAt || sess.createdAt || sess.date
      };
    });

    const directTrainerReviews = (gym.reviews || [])
      .filter((r: any) => r.type === 'trainer')
      .map((r: any) => ({
        _id: r._id?.toString() || Math.random().toString(),
        customerId: r.userId,
        customerName: r.userName || 'Verified Member',
        customerPhoto: r.userPhoto || '',
        customerEmail: '',
        trainerId: null,
        trainerName: r.trainerName || 'Gym Trainer',
        trainerPhoto: '',
        trainerSpecialization: 'Fitness Trainer',
        rating: Number(r.rating) || 5,
        review: r.review || '',
        sessionMode: 'In-Gym',
        bookingId: '',
        sessionDate: '',
        createdAt: r.createdAt || gym.createdAt
      }));

    const trainerReviews = [...mappedTrainerSessionReviews, ...directTrainerReviews].sort(
      (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Summary statistics
    const gymAvg = gymReviews.length > 0
      ? Number((gymReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / gymReviews.length).toFixed(1))
      : (gym.rating || 5.0);

    const trainerAvg = trainerReviews.length > 0
      ? Number((trainerReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / trainerReviews.length).toFixed(1))
      : 5.0;

    const gymBreakdown: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    gymReviews.forEach((r: any) => {
      const star = Math.max(1, Math.min(5, Math.round(r.rating)));
      gymBreakdown[star] = (gymBreakdown[star] || 0) + 1;
    });

    const trainerBreakdown: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    trainerReviews.forEach((r: any) => {
      const star = Math.max(1, Math.min(5, Math.round(r.rating)));
      trainerBreakdown[star] = (trainerBreakdown[star] || 0) + 1;
    });

    res.status(200).json({
      success: true,
      gym: {
        _id: gym._id,
        name: gym.name,
        logo: gym.logo,
        rating: gymAvg,
        reviewCount: gymReviews.length
      },
      summary: {
        gym: {
          totalReviews: gymReviews.length,
          averageRating: gymAvg,
          breakdown: gymBreakdown
        },
        trainer: {
          totalReviews: trainerReviews.length,
          averageRating: trainerAvg,
          breakdown: trainerBreakdown
        },
        totalReviewsCount: gymReviews.length + trainerReviews.length
      },
      gymReviews,
      trainerReviews
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};



