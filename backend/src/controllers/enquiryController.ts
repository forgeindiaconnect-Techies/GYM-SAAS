import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import Enquiry, { EnquiryStatus } from '../models/Enquiry';
import Gym from '../models/Gym';
import Notification from '../models/Notification';
import User, { Role } from '../models/User';

// Public endpoint to create an enquiry
export const createEnquiry = async (req: Request, res: Response): Promise<void> => {
  try {
    const { customerName, mobileNumber, email, address, city, gymId, branchId, enquiryType, message, preferredContactMethod } = req.body;

    if (!customerName || !mobileNumber || !email || !gymId || !enquiryType || !message) {
      res.status(400).json({ success: false, message: 'Missing required fields' });
      return;
    }

    // Verify the gym and get the gymOwnerId
    const gym = await Gym.findById(gymId);
    if (!gym) {
      res.status(404).json({ success: false, message: 'Gym not found' });
      return;
    }

    const enquiryId = `ENQ${Date.now()}${Math.floor(Math.random() * 1000)}`;

    const enquiry = new Enquiry({
      enquiryId,
      customerName,
      mobileNumber,
      email,
      address,
      city,
      gymId,
      branchId,
      gymOwnerId: gym.ownerId, // Set directly from verified Gym data
      enquiryType,
      message,
      preferredContactMethod: preferredContactMethod || 'Phone Call',
      status: EnquiryStatus.NEW,
    });

    await enquiry.save();

    if (gym.ownerId) {
      await Notification.create({
        recipientId: gym.ownerId,
        recipientRole: 'GYM_OWNER',
        gymId: gym._id,
        title: `New Enquiry from ${customerName}`,
        message: `${customerName} enquired about ${enquiryType}: "${message.slice(0, 80)}"`,
        type: 'alert',
        relatedRecordId: enquiry._id,
        link: '/admin/enquiries'
      }).catch(err => console.error('Notif error:', err));
    }

    res.status(201).json({ success: true, message: 'Enquiry submitted successfully', enquiry });
  } catch (error: any) {
    console.error('Error creating enquiry:', error);
    res.status(500).json({ success: false, message: 'Failed to submit enquiry', error: error.message });
  }
};

// Protected endpoint to get enquiries based on role
export const getEnquiries = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    let filter: any = {};

    if (user.role === Role.SUPER_ADMIN) {
      // Can see all enquiries
    } else if (user.role === Role.GYM_OWNER || user.role === Role.GYM_MANAGER || (user.role as string) === 'ADMIN') {
      const branchIdQuery = req.query.branchId as string;
      const effectiveBranchId = user.branchId || branchIdQuery;
      if (effectiveBranchId && effectiveBranchId !== 'all') {
        if (effectiveBranchId === 'main') {
          filter.$or = [
            { gymOwnerId: user.id, branchId: { $exists: false } },
            { gymOwnerId: user.id, branchId: null },
            { gymId: user.gymId, branchId: { $exists: false } },
            { gymId: user.gymId, branchId: null }
          ];
        } else {
          filter.branchId = effectiveBranchId;
        }
      } else {
        filter.$or = [{ gymOwnerId: user.id }, { gymId: user.gymId }];
      }
    } else if (user.role === Role.MEMBER) {
      // Customer sees their own enquiries based on email
      // If we eventually link them to a userId, we could filter by that.
      // But since enquiries are created before user accounts, we filter by their email.
      // We must fetch the user to get their email
      const reqUserObj = await (await import('../models/User')).default.findById(user.id);
      if (reqUserObj) {
         filter.email = reqUserObj.email;
      } else {
         res.status(404).json({ success: false, message: 'User not found' });
         return;
      }
    } else {
      res.status(403).json({ success: false, message: 'Forbidden' });
      return;
    }

    const enquiries = await Enquiry.find(filter)
      .populate('gymId', 'name location')
      .populate('branchId', 'name location')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, enquiries });
  } catch (error: any) {
    console.error('Error fetching enquiries:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch enquiries' });
  }
};

// Protected endpoint to update status (Gym Owner / Super Admin)
export const updateEnquiryStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, ownerNotes } = req.body;
    const user = req.user;

    const enquiry = await Enquiry.findById(id);
    if (!enquiry) {
      res.status(404).json({ success: false, message: 'Enquiry not found' });
      return;
    }

    // Verify ownership if not super admin
    if (user?.role !== Role.SUPER_ADMIN && enquiry.gymOwnerId.toString() !== user?.id) {
      res.status(403).json({ success: false, message: 'Forbidden' });
      return;
    }

    if (status) {
      enquiry.status = status;
      if (status === EnquiryStatus.CONTACTED && !enquiry.contactedAt) {
        enquiry.contactedAt = new Date();
      }
    }
    
    if (ownerNotes !== undefined) {
      enquiry.ownerNotes = ownerNotes;
    }

    await enquiry.save();
    res.status(200).json({ success: true, message: 'Enquiry updated successfully', enquiry });
  } catch (error: any) {
    console.error('Error updating enquiry:', error);
    res.status(500).json({ success: false, message: 'Failed to update enquiry' });
  }
};

// Public endpoint for Contact Us form with notifications to Gym Owners and Super Admin
export const submitContactMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { firstName, lastName, email, message, phone } = req.body;

    if (!email || !message) {
      res.status(400).json({ success: false, message: 'Email and message are required' });
      return;
    }

    const customerName = `${firstName || ''} ${lastName || ''}`.trim() || 'Website Visitor';
    const enquiryId = `CNT${Date.now()}${Math.floor(Math.random() * 1000)}`;

    // 1. Fetch Super Admins and Gym Owners
    const superAdmins = await User.find({ role: Role.SUPER_ADMIN }).select('_id email firstName lastName').lean();
    const gymOwners = await User.find({ role: Role.GYM_OWNER, isActive: { $ne: false } }).select('_id gymId email firstName lastName').lean();

    // 2. Fetch gyms for these owners
    const gymList = await Gym.find({
      $or: [
        { ownerId: { $in: gymOwners.map(o => o._id) } },
        { _id: { $in: gymOwners.map(o => o.gymId).filter(Boolean) } }
      ]
    }).select('_id name ownerId').lean();

    const gymMap = new Map<string, any>();
    gymList.forEach(g => {
      if (g.ownerId) gymMap.set(g.ownerId.toString(), g);
      gymMap.set(g._id.toString(), g);
    });

    const primaryOwner = gymOwners[0];
    const primaryGym = primaryOwner ? (gymMap.get(primaryOwner._id.toString()) || gymList[0]) : null;

    // 3. Save primary Enquiry record
    const enquiry = new Enquiry({
      enquiryId,
      customerName,
      mobileNumber: phone || '',
      email,
      gymId: primaryGym?._id || undefined,
      gymOwnerId: primaryOwner?._id || undefined,
      enquiryType: 'Website Contact Message',
      message,
      preferredContactMethod: 'Email',
      status: EnquiryStatus.NEW,
    });
    await enquiry.save();

    // Also create records for all other gym owners so each owner can see this enquiry in their dashboard
    for (let i = 1; i < gymOwners.length; i++) {
      const owner = gymOwners[i];
      const ownerGym = gymMap.get(owner._id.toString()) || gymList[i] || primaryGym;
      await Enquiry.create({
        enquiryId: `CNT${Date.now()}${Math.floor(Math.random() * 1000)}${i}`,
        customerName,
        mobileNumber: phone || '',
        email,
        gymId: ownerGym?._id || undefined,
        gymOwnerId: owner._id,
        enquiryType: 'Website Contact Message',
        message,
        preferredContactMethod: 'Email',
        status: EnquiryStatus.NEW,
      }).catch(err => console.error('Enquiry copy err:', err));
    }

    // 4. Create Notification for each Super Admin
    for (const sa of superAdmins) {
      await Notification.create({
        recipientId: sa._id,
        recipientRole: 'SUPER_ADMIN',
        title: `New Contact Message from ${customerName}`,
        message: `${customerName} (${email}): "${message.slice(0, 140)}"`,
        type: 'message',
        relatedRecordId: enquiry._id,
        link: '/super-admin/leads',
        isRead: false
      }).catch(err => console.error('SuperAdmin notif error:', err));
    }

    // 5. Create Notification for each Gym Owner
    for (const owner of gymOwners) {
      const ownerGym = gymMap.get(owner._id.toString());
      await Notification.create({
        recipientId: owner._id,
        recipientRole: 'GYM_OWNER',
        gymId: ownerGym?._id || owner.gymId,
        title: `New Contact Message from ${customerName}`,
        message: `${customerName} (${email}): "${message.slice(0, 140)}"`,
        type: 'message',
        relatedRecordId: enquiry._id,
        link: '/admin/enquiries',
        isRead: false
      }).catch(err => console.error('GymOwner notif error:', err));
    }

    res.status(200).json({
      success: true,
      message: 'Message sent successfully. Notifications sent to Gym Owners and Super Admin.',
      enquiryId: enquiry.enquiryId,
      notified: {
        superAdminsCount: superAdmins.length,
        gymOwnersCount: gymOwners.length
      }
    });
  } catch (error: any) {
    console.error('Error in submitContactMessage:', error);
    res.status(500).json({ success: false, message: 'Failed to send message', error: error.message });
  }
};

