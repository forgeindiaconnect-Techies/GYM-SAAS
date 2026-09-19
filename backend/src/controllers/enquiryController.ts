import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import Enquiry, { EnquiryStatus } from '../models/Enquiry';
import Gym from '../models/Gym';
import { Role } from '../models/User';

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
    } else if (user.role === Role.GYM_OWNER || user.role === Role.GYM_MANAGER) {
      filter.gymOwnerId = user.id;
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
