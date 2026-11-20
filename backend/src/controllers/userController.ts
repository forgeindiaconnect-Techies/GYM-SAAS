import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import User, { Role, ApprovalStatus, SubscriptionStatus } from '../models/User';
import { AuthRequest } from '../middlewares/auth';
import Gym from '../models/Gym';
import CustomerMembership, { CustomerMembershipStatus } from '../models/CustomerMembership';
import Subscription, { SubscriptionPaymentStatus } from '../models/Subscription';

export const getUsersByRole = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { role, status, gymId } = req.query;
    
    let filter: any = {};
    if (role) {
      filter.role = role as string;
    }
    if (status) {
      filter.approvalStatus = status;
    } else {
      filter.approvalStatus = { $ne: 'DELETED' };
    }

    // Role-based filtering
    if (req.user?.role === 'GYM_OWNER' || req.user?.role === 'GYM_MANAGER') {
      let resolvedGymId = req.user.gymId;
      if (!resolvedGymId && req.user.id) {
        const gym = await Gym.findOne({ ownerId: req.user.id });
        if (gym) resolvedGymId = String(gym._id);
      }
      if (resolvedGymId) {
        filter.gymId = resolvedGymId;
      }
    } else if (req.user?.role === 'SUPER_ADMIN' && gymId) {
      filter.gymId = gymId;
    }

    const branchIdQuery = req.query.branchId as string;
    const effectiveBranchId = req.user?.branchId || branchIdQuery;
    if (effectiveBranchId && effectiveBranchId !== 'all') {
      if (effectiveBranchId === 'main') {
        filter.$or = [{ branchId: { $exists: false } }, { branchId: null }];
      } else {
        filter.branchId = effectiveBranchId;
      }
    }

    const rawUsers = await User.find(filter)
      .populate('gymId')
      .populate('branchId', 'branchName name')
      .populate('assignedTrainer', 'name trainerId specialization email')
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .lean();

    const gymIds = rawUsers.map((u: any) => u.gymId?._id || u.gymId).filter(Boolean);
    let branchesMap: Record<string, any[]> = {};
    if (gymIds.length > 0) {
      const Branch = (await import('../models/Branch')).default;
      const branches = await Branch.find({ gymId: { $in: gymIds } }).lean();
      branches.forEach((b: any) => {
        const gId = b.gymId?.toString();
        if (gId) {
          if (!branchesMap[gId]) branchesMap[gId] = [];
          branchesMap[gId].push(b);
        }
      });
    }

    const users = rawUsers.map((u: any) => {
      const gId = u.gymId?._id?.toString() || u.gymId?.toString();
      return {
        ...u,
        branches: gId && branchesMap[gId] ? branchesMap[gId] : []
      };
    });

    res.status(200).json({ success: true, users });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const updateUserStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;
    
    const user = await User.findById(id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    // Normalize incoming status string
    let normalizedStatus: ApprovalStatus = ApprovalStatus.PENDING;
    const s = String(status || '').toUpperCase().trim();
    if (s === 'APPROVED' || s === 'ACTIVE' || s === 'EXISTING') {
      normalizedStatus = ApprovalStatus.APPROVED;
    } else if (s === 'REJECTED') {
      normalizedStatus = ApprovalStatus.REJECTED;
    } else if (s === 'INACTIVE') {
      normalizedStatus = ApprovalStatus.INACTIVE;
    } else if (s === 'SUSPENDED') {
      normalizedStatus = ApprovalStatus.SUSPENDED;
    } else if (s === 'DELETED') {
      normalizedStatus = ApprovalStatus.DELETED;
    } else {
      normalizedStatus = ApprovalStatus.PENDING;
    }

    user.approvalStatus = normalizedStatus;
    const customDetail = (req.body.statusDetail || '').trim();
    user.statusDetail = customDetail || (
      normalizedStatus === ApprovalStatus.APPROVED ? (s === 'EXISTING' ? 'Existing' : 'Active') :
      normalizedStatus === ApprovalStatus.INACTIVE ? 'Inactive' :
      normalizedStatus === ApprovalStatus.SUSPENDED ? 'Inactive' :
      normalizedStatus === ApprovalStatus.REJECTED ? 'Rejected' :
      (status === 'New' ? 'New' : 'Pending')
    );

    if (normalizedStatus === ApprovalStatus.REJECTED) {
      user.rejectionReason = reason;
      user.isActive = false;
      user.subscriptionStatus = SubscriptionStatus.REJECTED;
      user.paymentStatus = 'Rejected';

      await CustomerMembership.updateMany(
        { userId: user._id },
        { $set: { status: CustomerMembershipStatus.REJECTED } }
      ).catch(() => {});

    } else if (normalizedStatus === ApprovalStatus.INACTIVE || normalizedStatus === ApprovalStatus.SUSPENDED) {
      (user as any).suspensionReason = reason || 'inactive';
      user.isActive = false;
      user.subscriptionStatus = SubscriptionStatus.EXPIRED;

      await CustomerMembership.updateMany(
        { userId: user._id },
        { $set: { status: CustomerMembershipStatus.EXPIRED } }
      ).catch(() => {});

    } else if (normalizedStatus === ApprovalStatus.PENDING) {
      user.isActive = true;
      user.paymentStatus = 'Pending Verification';
      user.subscriptionStatus = SubscriptionStatus.PENDING;

      await CustomerMembership.updateMany(
        { userId: user._id },
        { $set: { status: CustomerMembershipStatus.PENDING_APPROVAL } }
      ).catch(() => {});

    } else if (normalizedStatus === ApprovalStatus.APPROVED) {
      user.isActive = true;
      user.rejectionReason = undefined;
      (user as any).suspensionReason = undefined;

      if (user.role === Role.MEMBER) {
        user.paymentStatus = 'Approved';
        user.subscriptionStatus = SubscriptionStatus.ACTIVE;

        const now = new Date();
        try {
          const memberships = await CustomerMembership.find({ userId: user._id });
          if (memberships.length > 0) {
            let latestExpiry = now;
            for (const m of memberships) {
              const start = m.startDate ? new Date(m.startDate) : now;
              const durLower = (m.duration || '1 Month').toLowerCase();
              const mEnd = new Date(start);
              if (durLower.includes('year')) {
                mEnd.setFullYear(mEnd.getFullYear() + (parseInt(durLower) || 1));
              } else if (durLower.includes('month')) {
                mEnd.setMonth(mEnd.getMonth() + (parseInt(durLower) || 1));
              } else if (durLower.includes('week')) {
                mEnd.setDate(mEnd.getDate() + ((parseInt(durLower) || 1) * 7));
              } else if (durLower.includes('day')) {
                mEnd.setDate(mEnd.getDate() + (parseInt(durLower) || 1));
              } else {
                mEnd.setMonth(mEnd.getMonth() + 1);
              }

              m.status = CustomerMembershipStatus.ACTIVE;
              m.startDate = start;
              m.endDate = mEnd;
              await m.save();

              if (mEnd > latestExpiry) latestExpiry = mEnd;
            }

            user.subscriptionExpiry = latestExpiry;
            (user as any).subscriptionExpiryDate = latestExpiry;
          } else {
            const targetGymId = user.gymId || (req as any).user?.gymId;
            const defaultEnd = new Date(now);
            defaultEnd.setMonth(defaultEnd.getMonth() + 1);
            user.subscriptionExpiry = defaultEnd;
            (user as any).subscriptionExpiryDate = defaultEnd;

            if (targetGymId) {
              await CustomerMembership.create({
                userId: user._id,
                gymId: targetGymId,
                branchId: user.branchId || (req as any).user?.branchId,
                planName: user.subscriptionPlan || '1-Month Membership',
                duration: '1 Month',
                price: 0,
                discount: 0,
                tax: 0,
                finalAmount: 0,
                paymentMethod: 'Approved by Gym Owner',
                status: CustomerMembershipStatus.ACTIVE,
                startDate: now,
                endDate: defaultEnd,
              });
            }
          }
        } catch (memErr) {
          console.error('Membership update warning in updateUserStatus:', memErr);
        }
      } else if (user.role === Role.GYM_OWNER || user.role === Role.ADMIN) {
        // Gym owners must choose a package plan and pay before subscription is active
        const activeSub = await Subscription.findOne({
          userId: user._id,
          status: SubscriptionPaymentStatus.ACTIVE,
          endDate: { $gte: new Date() }
        });

        if (activeSub) {
          user.subscriptionStatus = SubscriptionStatus.ACTIVE;
          user.subscriptionPlan = activeSub.plan;
          user.subscriptionExpiry = activeSub.endDate;
          (user as any).subscriptionExpiryDate = activeSub.endDate;
          user.paymentStatus = 'Approved';
        } else {
          user.subscriptionStatus = SubscriptionStatus.NONE;
          user.subscriptionPlan = undefined;
          user.subscriptionExpiry = undefined;
          (user as any).subscriptionExpiryDate = undefined;
          user.paymentStatus = 'Pending Verification';
        }
      }
    }

    // Save with resilient fallback
    try {
      await user.save();
    } catch (saveErr) {
      console.warn('User save warning, persisting status directly:', saveErr);
      await User.findByIdAndUpdate(user._id, {
        $set: {
          approvalStatus: user.approvalStatus,
          statusDetail: user.statusDetail,
          isActive: user.isActive,
          paymentStatus: user.paymentStatus,
          subscriptionStatus: user.subscriptionStatus,
          subscriptionExpiry: user.subscriptionExpiry,
          subscriptionExpiryDate: (user as any).subscriptionExpiryDate,
          rejectionReason: user.rejectionReason,
          suspensionReason: (user as any).suspensionReason,
        }
      });
    }
    
    // Sync gym status whenever user (gym owner) status changes
    if (((user.role as any) === 'GYM_OWNER' || (user.role as any) === 'ADMIN') && user.gymId) {
      let gymStatus: string;
      if (normalizedStatus === ApprovalStatus.APPROVED) gymStatus = 'ACTIVE';
      else if (normalizedStatus === ApprovalStatus.SUSPENDED) gymStatus = 'SUSPENDED';
      else if (normalizedStatus === ApprovalStatus.REJECTED) gymStatus = 'INACTIVE';
      else gymStatus = 'PENDING';
      
      await Gym.findByIdAndUpdate(user.gymId, { status: gymStatus }).catch(() => {});
    }
    
    res.status(200).json({ success: true, user });
  } catch (error: any) {
    console.error('updateUserStatus error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    const { id } = req.params;
    const { gymData, ...updateData } = req.body;
    if (updateData.phone && !updateData.mobile) {
      updateData.mobile = updateData.phone;
    }

    if (updateData.mobile !== undefined && updateData.mobile !== null && updateData.mobile !== '') {
      const cleanMobile = String(updateData.mobile).replace(/\D/g, '');
      if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
        res.status(400).json({
          success: false,
          message: 'Mobile number must be exactly 10 digits and start with 6, 7, 8, or 9'
        });
        return;
      }
      updateData.mobile = cleanMobile;
    }

    if (updateData.emergencyContact?.mobile) {
      const cleanEmerg = String(updateData.emergencyContact.mobile).replace(/\D/g, '');
      if (cleanEmerg && !/^[6-9]\d{9}$/.test(cleanEmerg)) {
        res.status(400).json({
          success: false,
          message: 'Emergency contact mobile must be exactly 10 digits and start with 6, 7, 8, or 9'
        });
        return;
      }
      updateData.emergencyContact.mobile = cleanEmerg;
    }

    let user = await User.findById(id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const callerRole = String(authReq.user?.role || '').toUpperCase();
    if (callerRole === Role.MEMBER || callerRole === Role.TRAINER) {
      if (String(authReq.user?.id) !== String(id)) {
        res.status(403).json({ success: false, message: 'Unauthorized: you can only update your own profile' });
        return;
      }
      // Prevent self-escalation of privileged account/subscription fields
      delete updateData.role;
      delete updateData.approvalStatus;
      delete updateData.isActive;
      delete updateData.subscriptionStatus;
      delete updateData.paymentStatus;
      delete updateData.gymId;
    }

    // Strict gym ownership check for Gym Owners / Managers
    if (
      authReq.user &&
      (authReq.user.role === Role.GYM_OWNER || authReq.user.role === Role.GYM_MANAGER) &&
      authReq.user.gymId &&
      user.gymId &&
      String(user.gymId) !== String(authReq.user.gymId)
    ) {
      res.status(403).json({ success: false, message: 'Unauthorized: member belongs to another gym' });
      return;
    }

    // Validate & normalize assignedTrainer if present (must belong to the same gym)
    const unsetFields: Record<string, any> = {};
    if (Object.prototype.hasOwnProperty.call(updateData, 'assignedTrainer')) {
      const rawTrainer = updateData.assignedTrainer;
      if (!rawTrainer || rawTrainer === 'Unassigned') {
        delete updateData.assignedTrainer;
        unsetFields.assignedTrainer = 1;
      } else {
        const TrainerModel = (await import('../models/Trainer')).default;
        const matchedTrainer = await TrainerModel.findOne({
          $or: [{ _id: rawTrainer }, { userId: rawTrainer }],
          ...(user.gymId ? { gymId: user.gymId } : {}),
        }).lean();
        if (!matchedTrainer) {
          res.status(400).json({
            success: false,
            message: 'Selected trainer does not exist in this gym',
          });
          return;
        }
        updateData.assignedTrainer = matchedTrainer._id;
      }
    }

    if (gymData && user.gymId) {
      // Handle nested location data correctly if provided
      const updateGymObj: any = { ...gymData };
      if (updateGymObj.memberCapacity !== undefined) {
        updateGymObj.memberCapacity = updateGymObj.memberCapacity === '' ? undefined : Number(updateGymObj.memberCapacity);
      }
      if (updateGymObj.trainerCapacity !== undefined) {
        updateGymObj.trainerCapacity = updateGymObj.trainerCapacity === '' ? undefined : Number(updateGymObj.trainerCapacity);
      }
      if (updateGymObj.rating !== undefined) {
        updateGymObj.rating = updateGymObj.rating === '' ? undefined : Number(updateGymObj.rating);
      }
      if (gymData.location) {
        delete updateGymObj.location;
        for (const [key, value] of Object.entries(gymData.location)) {
          updateGymObj[`location.${key}`] = value;
        }
      }
      await Gym.findByIdAndUpdate(user.gymId, { $set: updateGymObj }, { new: true, runValidators: true });
    }

    const updateOps: any = { $set: updateData };
    if (Object.keys(unsetFields).length > 0) {
      updateOps.$unset = unsetFields;
    }

    user = await User.findByIdAndUpdate(id, updateOps, { new: true, runValidators: true })
      .populate('gymId')
      .populate('assignedTrainer', 'name trainerId specialization email')
      .select('-passwordHash');

    const userObj = user?.toObject() || user;
    if (userObj) {
      (userObj as any).phone = userObj.mobile;
      (userObj as any).id = userObj._id;
    }

    res.status(200).json({ success: true, user: userObj });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const uploadProfilePhoto = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const targetUserId = req.params?.id || req.user?.id;
    if (!targetUserId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    let photoUrl = '';

    if (req.file) {
      photoUrl = `/uploads/${req.file.filename}`;
    } else if (req.body?.profilePhoto) {
      photoUrl = req.body.profilePhoto;
    } else if (req.body?.photo) {
      photoUrl = req.body.photo;
    } else if (req.body?.base64) {
      photoUrl = req.body.base64.startsWith('data:') ? req.body.base64 : `data:image/jpeg;base64,${req.body.base64}`;
    }

    if (!photoUrl) {
      res.status(400).json({ success: false, message: 'No image file or photo data provided' });
      return;
    }

    const updatedUser = await User.findByIdAndUpdate(
      targetUserId,
      { $set: { profilePhoto: photoUrl } },
      { new: true }
    ).select('-passwordHash');

    if (!updatedUser) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const userObj = updatedUser.toObject();
    (userObj as any).phone = userObj.mobile;
    (userObj as any).id = userObj._id;

    res.status(200).json({
      success: true,
      message: 'Profile photo updated successfully',
      profilePhoto: photoUrl,
      user: userObj,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const assignTrainerToCustomer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { trainerId } = req.body;

    const member = await User.findById(id);
    if (!member || member.role !== Role.MEMBER) {
      res.status(404).json({ success: false, message: 'Customer not found' });
      return;
    }

    if (
      (req.user?.role === Role.GYM_OWNER || req.user?.role === Role.GYM_MANAGER) &&
      req.user.gymId &&
      member.gymId &&
      String(member.gymId) !== String(req.user.gymId)
    ) {
      res.status(403).json({ success: false, message: 'Unauthorized: customer belongs to another gym' });
      return;
    }

    if (!trainerId) {
      await User.findByIdAndUpdate(id, { $unset: { assignedTrainer: 1 } });
      res.status(200).json({ success: true, message: 'Trainer unassigned from customer' });
      return;
    }

    const TrainerModel = (await import('../models/Trainer')).default;
    const trainer = await TrainerModel.findOne({
      $or: [{ _id: trainerId }, { userId: trainerId }],
      ...(member.gymId ? { gymId: member.gymId } : {}),
    });

    if (!trainer) {
      res.status(404).json({ success: false, message: 'Trainer not found in this gym' });
      return;
    }

    const updated = await User.findByIdAndUpdate(
      id,
      { $set: { assignedTrainer: trainer._id } },
      { new: true }
    )
      .populate('assignedTrainer', 'name trainerId specialization email')
      .select('-passwordHash');

    res.status(200).json({ success: true, message: `Assigned ${trainer.name} to customer`, user: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndUpdate(id, { approvalStatus: 'DELETED' }, { new: true });
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }
    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const createUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { firstName, lastName, name, email, mobile, phone, role, subscriptionPlan, branchId } = req.body;
    const gymId = req.body.gymId || req.user?.gymId;
    const finalEmail = (email || `member_${Date.now()}@gymora.com`).trim().toLowerCase();
    const finalPhone = mobile || phone || '';
    if (finalPhone) {
      const cleanMobile = String(finalPhone).replace(/\D/g, '');
      if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
        res.status(400).json({
          success: false,
          message: 'Mobile number must be exactly 10 digits and start with 6, 7, 8, or 9'
        });
        return;
      }
    }

    let existingUser = await User.findOne({ email: finalEmail });
    if (existingUser) {
      res.status(400).json({ success: false, message: 'A user with this email already exists' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);

    const nameParts = (name || '').trim().split(' ');
    const fName = firstName || nameParts[0] || 'Member';
    const lName = lastName || nameParts.slice(1).join(' ') || '';

    const user = new User({
      firstName: fName,
      lastName: lName,
      email: finalEmail,
      mobile: finalPhone,
      passwordHash,
      role: role || Role.MEMBER,
      gymId,
      branchId: branchId || req.user?.branchId,
      approvalStatus: 'APPROVED',
      isActive: true,
      subscriptionPlan: subscriptionPlan || 'Annual Pass',
      subscriptionStatus: SubscriptionStatus.ACTIVE,
      paymentStatus: 'Approved'
    });

    await user.save();

    if (user.role === Role.MEMBER && gymId) {
      try {
        const startDate = new Date();
        const endDate = new Date();
        endDate.setFullYear(endDate.getFullYear() + 1);

        await CustomerMembership.create({
          userId: user._id,
          gymId,
          branchId: user.branchId,
          planName: subscriptionPlan || 'Standard Pass',
          duration: '1 Year',
          price: 0,
          startDate,
          endDate,
          status: CustomerMembershipStatus.ACTIVE,
          paymentMethod: 'Counter',
          membershipId: 'MEM-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
          receiptNumber: 'REC-' + Math.random().toString(36).substring(2, 8).toUpperCase()
        });
      } catch (memErr) {
        console.warn('Membership creation notice:', memErr);
      }
    }

    const userObj = user.toObject();
    delete (userObj as any).passwordHash;
    (userObj as any).id = user._id;
    (userObj as any).phone = user.mobile;

    res.status(201).json({ success: true, message: 'User created successfully', user: userObj });
  } catch (error: any) {
    console.error('Error in createUser:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const getCustomerDashboardSummary = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const userRole = String(req.user?.role || '').toUpperCase();
    if (!userId || userRole !== 'MEMBER') {
      res.status(403).json({ success: false, message: 'Customer access only.' });
      return;
    }

    const user = await User.findById(userId).select('-passwordHash');
    if (!user) {
      res.status(404).json({ success: false, message: 'Customer account not found.' });
      return;
    }

    const { ensureCustomerHasId, isGymActiveStatus } = await import('../utils/customerIsolation');
    const customerCode = await ensureCustomerHasId(user);

    const [
      Trainer,
      GymPackage,
      AIRecommendation,
      WorkoutPlan,
      TrainerPlanRequest,
      TrainerSession,
      ProgressLog,
      WorkoutProgress,
      DietProgress,
      Payment,
      Notification
    ] = await Promise.all([
      import('../models/Trainer').then(m => m.default),
      import('../models/GymPackage').then(m => m.default),
      import('../models/AIRecommendation').then(m => m.default),
      import('../models/WorkoutPlan').then(m => m.default),
      import('../models/TrainerPlanRequest').then(m => m.default),
      import('../models/TrainerSession').then(m => m.default),
      import('../models/ProgressLog').then(m => m.default),
      import('../models/WorkoutProgress').then(m => m.default),
      import('../models/DietProgress').then(m => m.default),
      import('../models/Payment').then(m => m.default),
      import('../models/Notification').then(m => m.default),
    ]);

    // 1. Selected Gym & its active trainers & packages
    let selectedGym: any = null;
    let availableTrainers: any[] = [];
    let gymPackages: any[] = [];

    if (user.gymId) {
      const gymDoc = await Gym.findById(user.gymId).populate('ownerId', 'firstName lastName email mobile').lean();
      if (gymDoc && isGymActiveStatus(gymDoc.status)) {
        selectedGym = gymDoc;
        [availableTrainers, gymPackages] = await Promise.all([
          Trainer.find({ gymId: gymDoc._id, status: 'Active' })
            .select('trainerId name email phone specialization experience trainingMode expertise bio availability availabilityStatus profilePhoto averageRating totalReviews')
            .sort({ createdAt: -1 })
            .lean(),
          GymPackage.find({ gymId: gymDoc._id, status: { $ne: 'Inactive' } })
            .sort({ monthlyPrice: 1, price: 1 })
            .lean()
        ]);
      }
    }

    // 2. Customer-scoped real records across ALL modules (never fabricated)
    const [
      latestAI,
      workoutPlans,
      trainerPlans,
      sessions,
      progressLogs,
      workoutProgressCount,
      dietProgressCount,
      memberships,
      payments,
      notificationsCount,
      unreadNotificationsCount,
      gymReviewsCount
    ] = await Promise.all([
      AIRecommendation.findOne({ customerId: user._id })
        .sort({ createdAt: -1 })
        .populate('trainerId', 'name specialization profilePhoto availabilityStatus')
        .lean(),
      WorkoutPlan.find({ customerId: user._id }).sort({ createdAt: -1 }).lean(),
      TrainerPlanRequest.find({ customerId: user._id, status: 'Approved' }).sort({ createdAt: -1 }).lean(),
      TrainerSession.find({ customerId: user._id })
        .populate('trainerId', 'name specialization profilePhoto')
        .sort({ date: -1, createdAt: -1 })
        .lean(),
      ProgressLog.find({ customerId: user._id }).sort({ loggedDate: -1 }).lean(),
      WorkoutProgress.countDocuments({ customerId: user._id, status: 'Completed' }),
      DietProgress.countDocuments({ customerId: user._id, completed: true }),
      CustomerMembership.find({ $or: [{ userId: user._id }, { customerId: user._id }] })
        .populate('gymId', 'name location logo')
        .sort({ createdAt: -1 })
        .lean(),
      Payment.find({ customerId: user._id }).sort({ createdAt: -1 }).lean(),
      Notification.countDocuments({ recipientId: user._id }),
      Notification.countDocuments({ recipientId: user._id, isRead: false }),
      Gym.aggregate([
        { $unwind: '$reviews' },
        { $match: { 'reviews.userId': user._id } },
        { $count: 'count' }
      ])
    ]);

    const upcomingSessions = sessions.filter((s: any) =>
      ['Requested', 'Accepted', 'Pending', 'Scheduled', 'Confirmed'].includes(s.status)
    );
    const completedSessions = sessions.filter((s: any) => s.status === 'Completed');
    const attendedSessions = sessions.filter((s: any) => s.attendanceStatus === 'Present' || s.status === 'Completed');
    const sessionReviewsCount = sessions.filter((s: any) => Number(s.customerRating) > 0).length;
    const directGymReviewsCount = gymReviewsCount[0]?.count || 0;

    const now = new Date();
    // Synchronize membership endDate with actual plan duration if inconsistent
    for (const m of (memberships as any[])) {
      if (m.duration && m.startDate) {
        const durLower = m.duration.toLowerCase();
        const start = new Date(m.startDate);
        const expectedEnd = new Date(start);

        if (m.planName?.toLowerCase().includes('trial') || durLower.includes('trial')) {
          expectedEnd.setDate(expectedEnd.getDate() + 7);
        } else if (durLower.includes('year')) {
          expectedEnd.setFullYear(expectedEnd.getFullYear() + (parseInt(durLower) || 1));
        } else if (durLower.includes('month')) {
          expectedEnd.setMonth(expectedEnd.getMonth() + (parseInt(durLower) || 1));
        } else if (durLower.includes('week')) {
          expectedEnd.setDate(expectedEnd.getDate() + ((parseInt(durLower) || 1) * 7));
        } else if (durLower.includes('day')) {
          expectedEnd.setDate(expectedEnd.getDate() + (parseInt(durLower) || 1));
        } else {
          expectedEnd.setMonth(expectedEnd.getMonth() + 1);
        }

        const currentEnd = m.endDate ? new Date(m.endDate) : null;
        if (!currentEnd || Math.abs((currentEnd.getTime() - expectedEnd.getTime()) / (1000 * 60 * 60 * 24)) > 5) {
          m.endDate = expectedEnd;
          await CustomerMembership.updateOne({ _id: m._id }, { $set: { endDate: expectedEnd } });
        }
      }
    }

    const activeMembership = memberships.find((m: any) =>
      (m.status === CustomerMembershipStatus.ACTIVE || m.status === CustomerMembershipStatus.FREE_TRIAL) &&
      (!m.endDate || new Date(m.endDate) >= now)
    ) || null;

    const approvedPayments = payments.filter((p: any) => p.status === 'Approved' || p.status === 'Completed');
    const totalPaidAmount = approvedPayments.reduce((sum: number, p: any) => sum + (Number(p.amount) || 0), 0);

    const hasAIWorkout = Boolean(latestAI && ((latestAI as any).workoutPlan?.exercises?.length || (latestAI as any).workoutRecommendation));
    const hasAIDiet = Boolean(latestAI && (latestAI as any).dietRecommendation);
    const trainerWorkoutPlans = trainerPlans.filter((r: any) => r.planType === 'Workout Plan');
    const trainerDietPlans = trainerPlans.filter((r: any) => r.planType === 'Diet Plan');

    res.status(200).json({
      success: true,
      customerId: customerCode,
      selectedGym: selectedGym ? { ...selectedGym, packages: gymPackages } : null,
      availableTrainers,
      modules: {
        aiFitnessAnalysis: {
          status: latestAI ? (latestAI.status || 'Generated') : 'Not Started',
          started: Boolean(latestAI),
          recommendation: latestAI || null,
        },
        aiWorkoutPlan: {
          hasPlan: workoutPlans.length > 0 || trainerWorkoutPlans.length > 0 || hasAIWorkout,
          count: workoutPlans.length + trainerWorkoutPlans.length + (hasAIWorkout ? 1 : 0),
          activePlan: workoutPlans[0] || trainerWorkoutPlans[0] || null,
          fromAI: hasAIWorkout,
        },
        aiDietPlan: {
          hasPlan: trainerDietPlans.length > 0 || hasAIDiet,
          count: trainerDietPlans.length + (hasAIDiet ? 1 : 0),
          activePlan: trainerDietPlans[0] || null,
          fromAI: hasAIDiet,
          loggedMealsCount: dietProgressCount,
        },
        myRoutine: {
          hasRoutine: workoutPlans.length > 0 || workoutProgressCount > 0 || trainerWorkoutPlans.length > 0,
          count: workoutPlans.length + trainerWorkoutPlans.length,
        },
        findATrainer: {
          count: availableTrainers.length,
        },
        trainingSessions: {
          total: sessions.length,
          upcomingCount: upcomingSessions.length,
          completedCount: completedSessions.length,
          sessions: sessions.slice(0, 10),
        },
        attendance: {
          count: attendedSessions.length,
          totalSessions: sessions.length,
        },
        progressTracking: {
          count: progressLogs.length + workoutProgressCount,
          logsCount: progressLogs.length,
          workoutLogsCount: workoutProgressCount,
          latestLog: progressLogs[0] || null,
        },
        membership: {
          hasActiveMembership: Boolean(activeMembership),
          activeMembership,
          totalCount: memberships.length,
          memberships,
        },
        payments: {
          count: payments.length,
          totalPaidAmount,
          payments: payments.slice(0, 10),
        },
        notifications: {
          total: notificationsCount,
          unread: unreadNotificationsCount,
        },
        reviews: {
          count: directGymReviewsCount + sessionReviewsCount,
        }
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
