import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import JobVacancy from '../models/JobVacancy';
import JobApplication, { JobApplicationStatus } from '../models/JobApplication';
import InterviewSchedule from '../models/InterviewSchedule';
import JobOffer from '../models/JobOffer';
import HiringRequest from '../models/HiringRequest';
import Gym from '../models/Gym';
import User from '../models/User';
import Trainer from '../models/Trainer';
import Notification from '../models/Notification';
import mongoose from 'mongoose';
import { sendJobApplicationStatusEmail } from '../utils/emailService';

// Helper to resolve gym for gym owner
const resolveGymForOwner = async (req: AuthRequest) => {
  if (req.user?.gymId) {
    const gym = await Gym.findById(req.user.gymId);
    if (gym) return gym;
  }
  if (req.user?.id) {
    const gym = await Gym.findOne({ ownerId: req.user.id });
    if (gym) return gym;
  }
  return null;
};

// Generic file upload endpoint for Resumes, Certifications & Photos
export const uploadDocument = async (req: any, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No file was uploaded' });
      return;
    }
    const fileUrl = `/uploads/resumes/${req.file.filename}`;
    res.status(200).json({
      success: true,
      fileUrl,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      message: 'Document uploaded successfully'
    });
  } catch (error: any) {
    console.error('Error in uploadDocument:', error);
    res.status(500).json({ success: false, message: error.message || 'File upload failed' });
  }
};

// ==========================================
// 1. PUBLIC APIS
// ==========================================

export const getPublicJobs = async (req: any, res: Response): Promise<void> => {
  try {
    const { 
      search, 
      location, 
      expertise, 
      experience, 
      employmentType, 
      minSalary, 
      maxSalary,
      page = 1, 
      limit = 20 
    } = req.query;

    const query: any = { status: 'Published' };

    // Search query on title, gymName, location, expertise, or description
    if (search && typeof search === 'string') {
      const term = search.trim();
      query.$or = [
        { title: { $regex: term, $options: 'i' } },
        { gymName: { $regex: term, $options: 'i' } },
        { location: { $regex: term, $options: 'i' } },
        { expertise: { $regex: term, $options: 'i' } },
        { description: { $regex: term, $options: 'i' } }
      ];
    }

    if (location && typeof location === 'string' && location !== 'all') {
      query.location = { $regex: location.trim(), $options: 'i' };
    }

    if (expertise && typeof expertise === 'string' && expertise !== 'all') {
      query.expertise = { $regex: expertise.trim(), $options: 'i' };
    }

    if (experience && typeof experience === 'string' && experience !== 'all') {
      query.experience = { $regex: experience.trim(), $options: 'i' };
    }

    if (employmentType && typeof employmentType === 'string' && employmentType !== 'all') {
      query.employmentType = employmentType.trim();
    }

    if (minSalary) {
      const min = Number(minSalary);
      if (!isNaN(min)) {
        query.salaryMax = { $gte: min };
      }
    }

    if (maxSalary) {
      const max = Number(maxSalary);
      if (!isNaN(max)) {
        query.salaryMin = { $lte: max };
      }
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [jobs, total] = await Promise.all([
      JobVacancy.find(query)
        .populate('gymId', 'name address city logo profilePhoto rating')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      JobVacancy.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      jobs,
      data: jobs,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit))
    });
  } catch (error: any) {
    console.error('Error fetching public jobs:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch job vacancies', error: error.message });
  }
};

export const getPublicJobById = async (req: any, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: 'Invalid vacancy ID' });
      return;
    }

    const job = await JobVacancy.findById(id).populate('gymId', 'name address city phone email logo rating');
    if (!job) {
      res.status(404).json({ success: false, message: 'Job vacancy not found' });
      return;
    }

    res.status(200).json({ success: true, job });
  } catch (error: any) {
    console.error('Error fetching job details:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch job details', error: error.message });
  }
};

// ==========================================
// 2. GYM OWNER APIS
// ==========================================

export const createOwnerJob = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const gym = await resolveGymForOwner(req);
    if (!gym) {
      res.status(404).json({ success: false, message: 'Gym not found for authenticated user' });
      return;
    }

    const {
      title,
      expertise,
      description,
      responsibilities,
      experience,
      qualifications,
      certifications,
      salaryMin,
      salaryMax,
      salaryType,
      isSalaryNegotiable,
      employmentType,
      location,
      workingHours,
      vacanciesCount,
      deadline,
      status = 'Published'
    } = req.body;

    if (!title || !description || !experience) {
      res.status(400).json({ success: false, message: 'Title, description, and required experience are required' });
      return;
    }

    const expertiseList = Array.isArray(expertise) 
      ? expertise 
      : (typeof expertise === 'string' ? expertise.split(',').map((s: string) => s.trim()).filter(Boolean) : []);

    const gymLoc = (gym as any).location?.address || (gym as any).location?.city || (gym as any).address || (gym as any).city || 'On-site';
    const vacancy = new JobVacancy({
      gymId: gym._id,
      ownerId: req.user?.id,
      branchId: req.user?.branchId,
      gymName: gym.name,
      title: title.trim(),
      expertise: expertiseList,
      description,
      responsibilities: responsibilities || '',
      experience,
      qualifications: qualifications || '',
      certifications: certifications || '',
      salaryMin: salaryMin ? Number(salaryMin) : undefined,
      salaryMax: salaryMax ? Number(salaryMax) : undefined,
      salaryType: salaryType || 'Monthly',
      isSalaryNegotiable: Boolean(isSalaryNegotiable),
      employmentType: employmentType || 'Full-time',
      location: location || gymLoc,
      workingHours: workingHours || '',
      vacanciesCount: vacanciesCount ? Number(vacanciesCount) : 1,
      deadline: deadline ? new Date(deadline) : undefined,
      status: ['Draft', 'Published', 'Closed'].includes(status) ? status : 'Published'
    });

    await vacancy.save();

    res.status(201).json({
      success: true,
      message: status === 'Draft' ? 'Job vacancy saved as draft' : 'Job vacancy published successfully',
      job: vacancy
    });
  } catch (error: any) {
    console.error('Error creating job vacancy:', error);
    res.status(500).json({ success: false, message: 'Failed to create job vacancy', error: error.message });
  }
};

export const getOwnerJobs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const gym = await resolveGymForOwner(req);
    if (!gym) {
      res.status(404).json({ success: false, message: 'Gym not found' });
      return;
    }

    const { status, search } = req.query;
    const query: any = { gymId: gym._id };

    if (status && status !== 'all') {
      query.status = status;
    }

    if (search && typeof search === 'string') {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { location: { $regex: search.trim(), $options: 'i' } },
        { expertise: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    const jobs = await JobVacancy.find(query).sort({ createdAt: -1 });

    res.status(200).json({ success: true, jobs });
  } catch (error: any) {
    console.error('Error fetching owner jobs:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch job vacancies', error: error.message });
  }
};

export const getOwnerJobById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const gym = await resolveGymForOwner(req);
    if (!gym) {
      res.status(404).json({ success: false, message: 'Gym not found' });
      return;
    }

    const job = await JobVacancy.findOne({ _id: id, gymId: gym._id });
    if (!job) {
      res.status(404).json({ success: false, message: 'Job vacancy not found' });
      return;
    }

    res.status(200).json({ success: true, job });
  } catch (error: any) {
    console.error('Error fetching owner job details:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch job details', error: error.message });
  }
};

export const updateOwnerJob = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const gym = await resolveGymForOwner(req);
    if (!gym) {
      res.status(404).json({ success: false, message: 'Gym not found' });
      return;
    }

    const job = await JobVacancy.findOne({ _id: id, gymId: gym._id });
    if (!job) {
      res.status(404).json({ success: false, message: 'Job vacancy not found' });
      return;
    }

    const fields = [
      'title', 'description', 'responsibilities', 'experience',
      'qualifications', 'certifications', 'salaryMin', 'salaryMax',
      'salaryType', 'isSalaryNegotiable', 'employmentType', 'location',
      'workingHours', 'vacanciesCount', 'deadline', 'status'
    ];

    fields.forEach(field => {
      if (req.body[field] !== undefined) {
        if (field === 'salaryMin' || field === 'salaryMax' || field === 'vacanciesCount') {
          (job as any)[field] = req.body[field] ? Number(req.body[field]) : undefined;
        } else if (field === 'deadline') {
          (job as any)[field] = req.body[field] ? new Date(req.body[field]) : undefined;
        } else {
          (job as any)[field] = req.body[field];
        }
      }
    });

    if (req.body.expertise) {
      job.expertise = Array.isArray(req.body.expertise)
        ? req.body.expertise
        : req.body.expertise.split(',').map((s: string) => s.trim()).filter(Boolean);
    }

    await job.save();

    res.status(200).json({ success: true, message: 'Job vacancy updated successfully', job });
  } catch (error: any) {
    console.error('Error updating job vacancy:', error);
    res.status(500).json({ success: false, message: 'Failed to update job vacancy', error: error.message });
  }
};

export const toggleJobStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const gym = await resolveGymForOwner(req);
    if (!gym) {
      res.status(404).json({ success: false, message: 'Gym not found' });
      return;
    }

    if (!['Draft', 'Published', 'Closed'].includes(status)) {
      res.status(400).json({ success: false, message: 'Invalid status value' });
      return;
    }

    const job = await JobVacancy.findOneAndUpdate(
      { _id: id, gymId: gym._id },
      { status },
      { new: true }
    );

    if (!job) {
      res.status(404).json({ success: false, message: 'Job vacancy not found' });
      return;
    }

    res.status(200).json({ success: true, message: `Job status updated to ${status}`, job });
  } catch (error: any) {
    console.error('Error toggling job status:', error);
    res.status(500).json({ success: false, message: 'Failed to toggle status', error: error.message });
  }
};

export const deleteOwnerJob = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const gym = await resolveGymForOwner(req);
    if (!gym) {
      res.status(404).json({ success: false, message: 'Gym not found' });
      return;
    }

    const job = await JobVacancy.findOneAndDelete({ _id: id, gymId: gym._id });
    if (!job) {
      res.status(404).json({ success: false, message: 'Job vacancy not found' });
      return;
    }

    // Clean up applications, interviews, offers for this job
    await Promise.all([
      JobApplication.deleteMany({ jobId: id }),
      InterviewSchedule.deleteMany({ jobId: id }),
      JobOffer.deleteMany({ jobId: id })
    ]);

    res.status(200).json({ success: true, message: 'Job vacancy deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting job vacancy:', error);
    res.status(500).json({ success: false, message: 'Failed to delete job vacancy', error: error.message });
  }
};

export const getOwnerApplications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const gym = await resolveGymForOwner(req);
    if (!gym) {
      res.status(404).json({ success: false, message: 'Gym not found' });
      return;
    }

    const { jobId, status, search } = req.query;
    const query: any = { gymId: gym._id };

    if (jobId && mongoose.Types.ObjectId.isValid(String(jobId))) {
      query.jobId = jobId;
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    if (search && typeof search === 'string') {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { email: { $regex: search.trim(), $options: 'i' } },
        { phone: { $regex: search.trim(), $options: 'i' } },
        { expertise: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    const applications = await JobApplication.find(query)
      .populate('jobId', 'title location employmentType salaryMin salaryMax salaryType')
      .populate('trainerId', 'firstName lastName email mobile profilePhoto city specialization experienceYears qualification certifications previousGym resumeUrl certificationUrl trainerMode bio')
      .sort({ createdAt: -1 });

    const formattedApplications = applications.map((app: any) => {
      const doc = app.toObject ? app.toObject() : app;
      const trainer: any = doc.trainerId || {};
      const exp = doc.workExperience || (trainer.experienceYears ? `${trainer.experienceYears} Years` : '1-2 Years');
      return {
        ...doc,
        fullName: doc.name || `${trainer.firstName || ''} ${trainer.lastName || ''}`.trim() || 'Trainer Candidate',
        yearsOfExperience: exp,
        workExperience: exp,
        preferredLocation: doc.preferredLocation || trainer.city || '',
        city: doc.preferredLocation || trainer.city || '',
        previousGym: (doc as any).previousGym || trainer.previousGym || '',
        certificationUrl: (doc as any).certificationUrl || trainer.certificationUrl || '',
        profilePhoto: doc.profilePhoto || trainer.profilePhoto || '',
        qualifications: doc.qualifications || trainer.qualification || '',
        certifications: doc.certifications || trainer.certifications || '',
        trainingMode: doc.employmentPreference || trainer.trainerMode || '',
      };
    });

    res.status(200).json({ success: true, applications: formattedApplications, data: formattedApplications });
  } catch (error: any) {
    console.error('Error fetching owner applications:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch applications', error: error.message });
  }
};

export const getOwnerApplicationById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const gym = await resolveGymForOwner(req);
    if (!gym) {
      res.status(404).json({ success: false, message: 'Gym not found' });
      return;
    }

    const application = await JobApplication.findOne({ _id: id, gymId: gym._id })
      .populate('jobId')
      .populate('trainerId', 'firstName lastName email mobile profilePhoto city specialization experienceYears qualification certifications previousGym resumeUrl certificationUrl trainerMode bio');

    if (!application) {
      res.status(404).json({ success: false, message: 'Application not found' });
      return;
    }

    const doc: any = application.toObject ? application.toObject() : application;
    const trainer: any = doc.trainerId || {};
    const exp = doc.workExperience || (trainer.experienceYears ? `${trainer.experienceYears} Years` : '1-2 Years');
    const formattedApplication = {
      ...doc,
      fullName: doc.name || `${trainer.firstName || ''} ${trainer.lastName || ''}`.trim() || 'Trainer Candidate',
      yearsOfExperience: exp,
      workExperience: exp,
      preferredLocation: doc.preferredLocation || trainer.city || '',
      city: doc.preferredLocation || trainer.city || '',
      previousGym: (doc as any).previousGym || trainer.previousGym || '',
      certificationUrl: (doc as any).certificationUrl || trainer.certificationUrl || '',
      profilePhoto: doc.profilePhoto || trainer.profilePhoto || '',
      qualifications: doc.qualifications || trainer.qualification || '',
      certifications: doc.certifications || trainer.certifications || '',
      trainingMode: doc.employmentPreference || trainer.trainerMode || '',
    };

    // Also fetch any scheduled interviews and job offers for this application
    const [interviews, offers] = await Promise.all([
      InterviewSchedule.find({ applicationId: id }).sort({ date: -1 }),
      JobOffer.find({ applicationId: id }).sort({ createdAt: -1 })
    ]);

    res.status(200).json({ success: true, application: formattedApplication, interviews, offers });
  } catch (error: any) {
    console.error('Error fetching application details:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch application details', error: error.message });
  }
};

export const updateApplicationStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, reviewNotes, comment } = req.body;
    const gym = await resolveGymForOwner(req);
    if (!gym) {
      res.status(404).json({ success: false, message: 'Gym not found' });
      return;
    }

    const validStatuses: JobApplicationStatus[] = [
      'Applied', 'Under Review', 'Shortlisted', 'Interview Scheduled', 
      'Selected', 'Offer Accepted', 'Offer Rejected', 'Rejected', 'Withdrawn'
    ];

    if (!validStatuses.includes(status)) {
      res.status(400).json({ success: false, message: 'Invalid status value' });
      return;
    }

    const application = await JobApplication.findOne({ _id: id, gymId: gym._id }).populate('jobId', 'title');
    if (!application) {
      res.status(404).json({ success: false, message: 'Application not found' });
      return;
    }

    const oldStatus = application.status;
    application.status = status;
    if (reviewNotes !== undefined) application.reviewNotes = reviewNotes;

    application.statusHistory.push({
      status,
      changedBy: new mongoose.Types.ObjectId(req.user?.id),
      changedAt: new Date(),
      comment: comment || `Status updated from ${oldStatus} to ${status}`
    });

    await application.save();

    // Update vacancy counts
    if (status === 'Shortlisted' && oldStatus !== 'Shortlisted') {
      await JobVacancy.findByIdAndUpdate(application.jobId, { $inc: { shortlistedCount: 1 } });
    } else if (oldStatus === 'Shortlisted' && status !== 'Shortlisted') {
      await JobVacancy.findByIdAndUpdate(application.jobId, { $inc: { shortlistedCount: -1 } });
    }

    // Send notification to Trainer
    try {
      const jobTitle = (application.jobId as any)?.title || 'Job Application';
      await Notification.create({
        recipientId: application.trainerId,
        recipientRole: 'TRAINER',
        gymId: gym._id,
        title: `Application Status Updated: ${status}`,
        message: `Your application for "${jobTitle}" at ${gym.name} has been updated to "${status}".`,
        type: status === 'Shortlisted' || status === 'Selected' ? 'success' : (status === 'Rejected' ? 'alert' : 'info'),
        link: '/trainer/applications'
      });
    } catch (notifErr) {
      console.error('Failed to dispatch notification:', notifErr);
    }

    // Dispatch direct status email to Candidate's respective mail ID
    try {
      const candidateEmail = application.email;
      const candidateName = application.name || 'Candidate';
      const jobTitle = (application.jobId as any)?.title || 'Fitness Trainer';
      const gymName = gym.name || 'Fitness Club';

      if (candidateEmail) {
        console.log(`[HiringController] Dispatching direct status email (${status}) to candidate email: ${candidateEmail}`);
        sendJobApplicationStatusEmail({
          toEmail: candidateEmail,
          candidateName,
          jobTitle,
          gymName,
          status,
          reviewNotes: reviewNotes || comment
        }).catch((emailErr) => {
          console.error(`[HiringController] Error sending candidate status email to ${candidateEmail}:`, emailErr);
        });
      }
    } catch (emailDispatchErr) {
      console.error('[HiringController] Failed to dispatch candidate status email:', emailDispatchErr);
    }

    res.status(200).json({
      success: true,
      message: `Application status updated to ${status}. Notification email sent to ${application.email}`,
      application
    });
  } catch (error: any) {
    console.error('Error updating application status:', error);
    res.status(500).json({ success: false, message: 'Failed to update application status', error: error.message });
  }
};

export const scheduleInterview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id || req.body.applicationId;
    const gym = await resolveGymForOwner(req);
    if (!gym) {
      res.status(404).json({ success: false, message: 'Gym not found' });
      return;
    }

    const application = await JobApplication.findOne({ _id: id, gymId: gym._id }).populate('jobId', 'title');
    if (!application) {
      res.status(404).json({ success: false, message: 'Application not found' });
      return;
    }

    const { date, time, durationMinutes, mode, locationOrLink, instructions } = req.body;
    if (!date || !time || !locationOrLink) {
      res.status(400).json({ success: false, message: 'Date, time, and location/link are required' });
      return;
    }

    const interview = new InterviewSchedule({
      applicationId: application._id,
      jobId: application.jobId,
      gymId: gym._id,
      trainerId: application.trainerId,
      scheduledBy: req.user?.id,
      jobTitle: (application.jobId as any)?.title || 'Fitness Trainer',
      candidateName: application.name,
      date: new Date(date),
      time,
      durationMinutes: durationMinutes ? Number(durationMinutes) : 30,
      mode: mode || 'In-Person',
      locationOrLink,
      instructions: instructions || '',
      status: 'Scheduled'
    });

    await interview.save();

    // Auto-update application status to 'Interview Scheduled'
    application.status = 'Interview Scheduled';
    application.statusHistory.push({
      status: 'Interview Scheduled',
      changedBy: new mongoose.Types.ObjectId(req.user?.id),
      changedAt: new Date(),
      comment: `Interview scheduled on ${new Date(date).toLocaleDateString()} at ${time} (${mode})`
    });
    await application.save();

    // Notify Trainer
    try {
      await Notification.create({
        recipientId: application.trainerId,
        recipientRole: 'TRAINER',
        gymId: gym._id,
        title: 'Interview Scheduled!',
        message: `An interview has been scheduled for "${(application.jobId as any)?.title || 'Trainer Role'}" on ${new Date(date).toLocaleDateString()} at ${time} via ${mode}.`,
        type: 'success',
        link: '/trainer/interviews'
      });
    } catch (notifErr) {
      console.error('Notification dispatch error:', notifErr);
    }

    res.status(201).json({ success: true, message: 'Interview scheduled successfully', interview });
  } catch (error: any) {
    console.error('Error scheduling interview:', error);
    res.status(500).json({ success: false, message: 'Failed to schedule interview', error: error.message });
  }
};

export const getOwnerInterviews = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const gym = await resolveGymForOwner(req);
    if (!gym) {
      res.status(404).json({ success: false, message: 'Gym not found' });
      return;
    }

    const interviews = await InterviewSchedule.find({ gymId: gym._id })
      .populate('applicationId', 'name email phone profilePhoto')
      .populate('jobId', 'title location')
      .sort({ date: 1 });

    res.status(200).json({ success: true, interviews });
  } catch (error: any) {
    console.error('Error fetching owner interviews:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch interviews', error: error.message });
  }
};

export const updateInterview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, feedback, rating, date, time, locationOrLink } = req.body;
    const gym = await resolveGymForOwner(req);
    if (!gym) {
      res.status(404).json({ success: false, message: 'Gym not found' });
      return;
    }

    const interview = await InterviewSchedule.findOne({ _id: id, gymId: gym._id });
    if (!interview) {
      res.status(404).json({ success: false, message: 'Interview not found' });
      return;
    }

    if (status) interview.status = status;
    if (feedback !== undefined) interview.feedback = feedback;
    if (rating !== undefined) interview.rating = Number(rating);
    if (date) interview.date = new Date(date);
    if (time) interview.time = time;
    if (locationOrLink) interview.locationOrLink = locationOrLink;

    await interview.save();

    res.status(200).json({ success: true, message: 'Interview updated', interview });
  } catch (error: any) {
    console.error('Error updating interview:', error);
    res.status(500).json({ success: false, message: 'Failed to update interview', error: error.message });
  }
};

export const issueJobOffer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id || req.body.applicationId;
    const gym = await resolveGymForOwner(req);
    if (!gym) {
      res.status(404).json({ success: false, message: 'Gym not found' });
      return;
    }

    const application = await JobApplication.findOne({ _id: id, gymId: gym._id }).populate('jobId', 'title');
    if (!application) {
      res.status(404).json({ success: false, message: 'Application not found' });
      return;
    }

    const { offeredSalary, salaryPeriod, employmentType, joiningDate, termsAndConditions } = req.body;
    if (!offeredSalary || !joiningDate) {
      res.status(400).json({ success: false, message: 'Offered salary and joining date are required' });
      return;
    }

    const offer = new JobOffer({
      applicationId: application._id,
      jobId: application.jobId,
      gymId: gym._id,
      trainerId: application.trainerId,
      issuedBy: req.user?.id,
      jobTitle: (application.jobId as any)?.title || 'Fitness Trainer',
      candidateName: application.name,
      offeredSalary: String(offeredSalary),
      salaryPeriod: salaryPeriod || 'Monthly',
      employmentType: employmentType || 'Full-time',
      joiningDate: new Date(joiningDate),
      termsAndConditions: termsAndConditions || '',
      status: 'Pending'
    });

    await offer.save();

    // Auto-update application status to 'Selected'
    application.status = 'Selected';
    application.statusHistory.push({
      status: 'Selected',
      changedBy: new mongoose.Types.ObjectId(req.user?.id),
      changedAt: new Date(),
      comment: `Job offer extended: ₹${offeredSalary} (${salaryPeriod || 'Monthly'}) joining on ${new Date(joiningDate).toLocaleDateString()}`
    });
    await application.save();

    // Notify Trainer
    try {
      await Notification.create({
        recipientId: application.trainerId,
        recipientRole: 'TRAINER',
        gymId: gym._id,
        title: '🎉 Job Offer Received!',
        message: `Congratulations! ${gym.name} has issued you a job offer for the position of "${(application.jobId as any)?.title || 'Fitness Trainer'}". Review and respond in your dashboard.`,
        type: 'success',
        link: '/trainer/job-offers'
      });
    } catch (notifErr) {
      console.error('Notification dispatch error:', notifErr);
    }

    res.status(201).json({ success: true, message: 'Job offer issued successfully', offer });
  } catch (error: any) {
    console.error('Error issuing job offer:', error);
    res.status(500).json({ success: false, message: 'Failed to issue job offer', error: error.message });
  }
};

export const getOwnerOffers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const gym = await resolveGymForOwner(req);
    if (!gym) {
      res.status(404).json({ success: false, message: 'Gym not found' });
      return;
    }

    const offers = await JobOffer.find({ gymId: gym._id })
      .populate('applicationId', 'name email phone profilePhoto')
      .populate('jobId', 'title location')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, offers });
  } catch (error: any) {
    console.error('Error fetching owner offers:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch job offers', error: error.message });
  }
};

export const getOwnerHiredTrainers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const gym = await resolveGymForOwner(req);
    if (!gym) {
      res.status(404).json({ success: false, message: 'Gym not found' });
      return;
    }

    // Find applications with 'Offer Accepted' status
    const hiredApplications = await JobApplication.find({ gymId: gym._id, status: 'Offer Accepted' })
      .populate('jobId', 'title location employmentType')
      .populate('trainerId', 'firstName lastName email mobile profilePhoto')
      .sort({ updatedAt: -1 });

    // Also fetch the associated Trainer models in gym roster
    const trainerUserIds = hiredApplications.map(a => a.trainerId?._id || a.trainerId).filter(Boolean);
    const gymTrainers = await Trainer.find({ gymId: gym._id, userId: { $in: trainerUserIds } });

    res.status(200).json({ 
      success: true, 
      hiredApplications,
      gymTrainers 
    });
  } catch (error: any) {
    console.error('Error fetching hired trainers:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch hired trainers', error: error.message });
  }
};

// ==========================================
// 3. TRAINER APIS
// ==========================================

export const applyToJob = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { jobId } = req.params;
    const trainerUser = await User.findById(req.user?.id);
    if (!trainerUser) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    if (trainerUser.role?.toUpperCase() !== 'TRAINER') {
      res.status(403).json({ success: false, message: 'Only registered trainers can apply for gym coaching vacancies' });
      return;
    }

    const job = await JobVacancy.findById(jobId);
    if (!job) {
      res.status(404).json({ success: false, message: 'Job vacancy not found' });
      return;
    }

    if (job.status !== 'Published') {
      res.status(400).json({ success: false, message: 'This vacancy is no longer accepting applications' });
      return;
    }

    if (job.deadline && new Date(job.deadline) < new Date()) {
      res.status(400).json({ success: false, message: 'The application deadline for this vacancy has expired' });
      return;
    }

    // Check duplicate application
    const existing = await JobApplication.findOne({ jobId: job._id, trainerId: trainerUser._id });
    if (existing) {
      res.status(400).json({ 
        success: false, 
        message: 'You have already submitted an application for this vacancy. Please check your applications dashboard.' 
      });
      return;
    }

    // Handle resume file or URL
    let resumeUrl = req.body.resumeUrl;
    let resumeOriginalName = req.body.resumeOriginalName;

    if (req.file) {
      resumeUrl = `/uploads/resumes/${req.file.filename}`;
      resumeOriginalName = req.file.originalname;
    }

    if (!resumeUrl) {
      res.status(400).json({ success: false, message: 'Please upload or provide your resume.' });
      return;
    }

    const {
      name,
      email,
      phone,
      qualifications,
      certifications,
      workExperience,
      expertise,
      expectedSalary,
      preferredLocation,
      employmentPreference,
      availability,
      coverLetter
    } = req.body;

    const expertiseList = Array.isArray(expertise)
      ? expertise
      : (typeof expertise === 'string' ? expertise.split(',').map((s: string) => s.trim()).filter(Boolean) : []);

    const application = new JobApplication({
      jobId: job._id,
      gymId: job.gymId,
      trainerId: trainerUser._id,
      name: name || `${trainerUser.firstName} ${trainerUser.lastName}`.trim(),
      email: email || trainerUser.email,
      phone: phone || trainerUser.mobile,
      profilePhoto: trainerUser.profilePhoto || req.body.profilePhoto,
      qualifications: qualifications || '',
      certifications: certifications || '',
      workExperience: workExperience || '',
      expertise: expertiseList,
      expectedSalary: expectedSalary || '',
      preferredLocation: preferredLocation || '',
      employmentPreference: employmentPreference || job.employmentType || 'Full-time',
      availability: availability || 'Immediate',
      coverLetter: coverLetter || '',
      resumeUrl,
      resumeOriginalName,
      status: 'Applied',
      statusHistory: [{
        status: 'Applied',
        changedBy: trainerUser._id,
        changedAt: new Date(),
        comment: 'Application submitted by trainer'
      }]
    });

    await application.save();

    // Increment applicantsCount on job vacancy
    await JobVacancy.findByIdAndUpdate(job._id, { $inc: { applicantsCount: 1 } });

    // Notify Gym Owner
    try {
      const gym = await Gym.findById(job.gymId);
      if (gym?.ownerId) {
        await Notification.create({
          recipientId: gym.ownerId,
          recipientRole: 'GYM_OWNER',
          gymId: gym._id,
          title: 'New Trainer Job Application',
          message: `${application.name} has applied for "${job.title}". Review their resume in your hiring dashboard.`,
          type: 'info',
          link: '/admin/hiring/applications'
        });
      }
    } catch (notifErr) {
      console.error('Failed to notify gym owner:', notifErr);
    }

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully! The gym owner has been notified.',
      application
    });
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400).json({ success: false, message: 'You have already applied for this vacancy' });
      return;
    }
    console.error('Error submitting trainer application:', error);
    res.status(500).json({ success: false, message: 'Failed to submit application', error: error.message });
  }
};

export const getTrainerApplications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const applications = await JobApplication.find({ trainerId: req.user?.id })
      .populate('jobId', 'title gymName location employmentType salaryMin salaryMax salaryType status')
      .populate('gymId', 'name address city logo')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, applications, data: applications });
  } catch (error: any) {
    console.error('Error fetching trainer applications:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch your applications', error: error.message });
  }
};

export const getTrainerApplicationById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const application = await JobApplication.findOne({ _id: id, trainerId: req.user?.id })
      .populate('jobId')
      .populate('gymId', 'name address city phone email logo');

    if (!application) {
      res.status(404).json({ success: false, message: 'Application not found' });
      return;
    }

    const [interviews, offers] = await Promise.all([
      InterviewSchedule.find({ applicationId: id }).sort({ date: -1 }),
      JobOffer.find({ applicationId: id }).sort({ createdAt: -1 })
    ]);

    res.status(200).json({ success: true, application, interviews, offers });
  } catch (error: any) {
    console.error('Error fetching application details:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch application details', error: error.message });
  }
};

export const withdrawApplication = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const application = await JobApplication.findOne({ _id: id, trainerId: req.user?.id }).populate('jobId', 'title');
    if (!application) {
      res.status(404).json({ success: false, message: 'Application not found' });
      return;
    }

    if (['Offer Accepted', 'Rejected', 'Withdrawn'].includes(application.status)) {
      res.status(400).json({ 
        success: false, 
        message: `Cannot withdraw application in '${application.status}' state.` 
      });
      return;
    }

    application.status = 'Withdrawn';
    application.statusHistory.push({
      status: 'Withdrawn',
      changedBy: new mongoose.Types.ObjectId(req.user?.id),
      changedAt: new Date(),
      comment: 'Application voluntarily withdrawn by trainer'
    });
    await application.save();

    // Notify Gym Owner
    try {
      const gym = await Gym.findById(application.gymId);
      if (gym?.ownerId) {
        await Notification.create({
          recipientId: gym.ownerId,
          recipientRole: 'GYM_OWNER',
          gymId: gym._id,
          title: 'Trainer Application Withdrawn',
          message: `${application.name} has withdrawn their application for "${(application.jobId as any)?.title || 'Vacancy'}".`,
          type: 'alert',
          link: '/admin/hiring/applications'
        });
      }
    } catch (notifErr) {
      console.error('Notification dispatch error:', notifErr);
    }

    res.status(200).json({ success: true, message: 'Application withdrawn successfully', application });
  } catch (error: any) {
    console.error('Error withdrawing application:', error);
    res.status(500).json({ success: false, message: 'Failed to withdraw application', error: error.message });
  }
};

export const getTrainerInterviews = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const interviews = await InterviewSchedule.find({ trainerId: req.user?.id })
      .populate('gymId', 'name address city phone logo')
      .populate('jobId', 'title location')
      .sort({ date: 1 });

    res.status(200).json({ success: true, interviews });
  } catch (error: any) {
    console.error('Error fetching trainer interviews:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch interviews', error: error.message });
  }
};

export const getTrainerOffers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const offers = await JobOffer.find({ trainerId: req.user?.id })
      .populate('gymId', 'name address city phone email logo')
      .populate('jobId', 'title location employmentType')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, offers });
  } catch (error: any) {
    console.error('Error fetching trainer job offers:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch job offers', error: error.message });
  }
};

export const respondToJobOffer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params; // offerId
    const { action, declineReason } = req.body; // action: 'Accept' | 'Decline'

    if (!['Accept', 'Decline'].includes(action)) {
      res.status(400).json({ success: false, message: 'Action must be "Accept" or "Decline"' });
      return;
    }

    const offer = await JobOffer.findOne({ _id: id, trainerId: req.user?.id }).populate('gymId');
    if (!offer) {
      res.status(404).json({ success: false, message: 'Job offer not found' });
      return;
    }

    if (offer.status !== 'Pending') {
      res.status(400).json({ success: false, message: `This offer has already been ${offer.status.toLowerCase()}` });
      return;
    }

    const application = await JobApplication.findById(offer.applicationId);

    if (action === 'Accept') {
      offer.status = 'Accepted';
      offer.respondedAt = new Date();
      await offer.save();

      if (application) {
        application.status = 'Offer Accepted';
        application.statusHistory.push({
          status: 'Offer Accepted',
          changedBy: new mongoose.Types.ObjectId(req.user?.id),
          changedAt: new Date(),
          comment: 'Job offer accepted by candidate'
        });
        await application.save();

        // Increment hiredCount on job
        await JobVacancy.findByIdAndUpdate(offer.jobId, { $inc: { hiredCount: 1 } });

        // Connect the selected trainer to existing gym trainer-management workflow
        // Check if Trainer document exists for this user in this gym
        const existingTrainer = await Trainer.findOne({ gymId: offer.gymId, userId: req.user?.id });
        if (!existingTrainer) {
          const trainerUser = await User.findById(req.user?.id);
          await Trainer.create({
            gymId: offer.gymId,
            userId: req.user?.id,
            name: application.name || `${trainerUser?.firstName} ${trainerUser?.lastName}`.trim(),
            email: application.email || trainerUser?.email,
            phone: application.phone || trainerUser?.mobile,
            profilePhoto: application.profilePhoto || trainerUser?.profilePhoto,
            specialization: application.expertise?.[0] || 'Fitness Coach',
            expertise: application.expertise?.join(', ') || '',
            experience: 2,
            trainingMode: 'both',
            qualifications: application.qualifications,
            certifications: application.certifications,
            status: 'Active',
            availabilityStatus: 'Online',
            totalEarnings: 0,
            availableBalance: 0,
            withdrawnAmount: 0,
            pendingWithdrawal: 0,
            averageRating: 5.0,
            totalReviews: 0
          });
        } else {
          existingTrainer.status = 'Active';
          await existingTrainer.save();
        }
      }

      // Notify Gym Owner
      try {
        const gym = (offer.gymId as any);
        if (gym?.ownerId) {
          await Notification.create({
            recipientId: gym.ownerId,
            recipientRole: 'GYM_OWNER',
            gymId: gym._id,
            title: '🎉 Job Offer Accepted!',
            message: `${offer.candidateName} has accepted your job offer for "${offer.jobTitle}". They are now added to your trainer roster!`,
            type: 'success',
            link: '/admin/hiring/hired'
          });
        }
      } catch (notifErr) {
        console.error('Notification dispatch error:', notifErr);
      }

      res.status(200).json({ 
        success: true, 
        message: 'Congratulations! You have accepted the job offer. You are now connected with the gym.', 
        offer 
      });
    } else {
      // Decline
      offer.status = 'Declined';
      offer.respondedAt = new Date();
      offer.declineReason = declineReason || 'Candidate declined offer';
      await offer.save();

      if (application) {
        application.status = 'Offer Rejected';
        application.statusHistory.push({
          status: 'Offer Rejected',
          changedBy: new mongoose.Types.ObjectId(req.user?.id),
          changedAt: new Date(),
          comment: `Offer declined by candidate: ${declineReason || 'No reason provided'}`
        });
        await application.save();
      }

      // Notify Gym Owner
      try {
        const gym = (offer.gymId as any);
        if (gym?.ownerId) {
          await Notification.create({
            recipientId: gym.ownerId,
            recipientRole: 'GYM_OWNER',
            gymId: gym._id,
            title: 'Job Offer Declined',
            message: `${offer.candidateName} has declined the job offer for "${offer.jobTitle}". Reason: ${declineReason || 'Not specified'}.`,
            type: 'alert',
            link: '/admin/hiring/applications'
          });
        }
      } catch (notifErr) {
        console.error('Notification dispatch error:', notifErr);
      }

      res.status(200).json({ success: true, message: 'You have declined the job offer.', offer });
    }
  } catch (error: any) {
    console.error('Error responding to job offer:', error);
    res.status(500).json({ success: false, message: 'Failed to respond to job offer', error: error.message });
  }
};

// ==========================================
// 4. DIRECT HIRING & TRAINER DISCOVERY APIS
// ==========================================

export const getPublicTrainers = async (req: any, res: Response): Promise<void> => {
  try {
    const { 
      search, 
      location, 
      expertise, 
      experience, 
      employmentType, 
      salaryMin, 
      salaryMax, 
      availability,
      sortBy = 'relevance',
      page = 1, 
      limit = 20 
    } = req.query;

    const query: any = { 
      status: { $in: ['Active', 'Pending'] },
      $or: [
        { isPublicRecruitment: true },
        { isPublicRecruitment: { $exists: false } }
      ]
    };

    if (search && typeof search === 'string') {
      const term = search.trim();
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { name: { $regex: term, $options: 'i' } },
          { specialization: { $regex: term, $options: 'i' } },
          { professionalHeadline: { $regex: term, $options: 'i' } },
          { expertise: { $regex: term, $options: 'i' } },
          { bio: { $regex: term, $options: 'i' } }
        ]
      });
    }

    if (location && typeof location === 'string' && location !== 'all') {
      query.preferredLocation = { $regex: location.trim(), $options: 'i' };
    }

    if (expertise && typeof expertise === 'string' && expertise !== 'all') {
      query.$or = query.$or || [];
      query.$or.push(
        { expertise: { $regex: expertise.trim(), $options: 'i' } },
        { specialization: { $regex: expertise.trim(), $options: 'i' } }
      );
    }

    if (experience && typeof experience === 'string' && experience !== 'all') {
      const expNum = parseInt(experience, 10);
      if (!isNaN(expNum)) {
        query.experience = { $gte: expNum };
      }
    }

    if (employmentType && typeof employmentType === 'string' && employmentType !== 'all') {
      query.employmentPreference = { $in: [employmentType.trim(), 'Any'] };
    }

    if (availability && typeof availability === 'string' && availability !== 'all') {
      query.availabilityStatus = availability.trim();
    }

    if (salaryMin) {
      const min = Number(salaryMin);
      if (!isNaN(min)) {
        query.expectedSalary = { ...(query.expectedSalary || {}), $gte: min };
      }
    }

    if (salaryMax) {
      const max = Number(salaryMax);
      if (!isNaN(max)) {
        query.expectedSalary = { ...(query.expectedSalary || {}), $lte: max };
      }
    }

    let sortObj: any = { createdAt: -1 };
    if (sortBy === 'experience') sortObj = { experience: -1 };
    else if (sortBy === 'salaryLow') sortObj = { expectedSalary: 1 };
    else if (sortBy === 'salaryHigh') sortObj = { expectedSalary: -1 };
    else if (sortBy === 'rating') sortObj = { averageRating: -1 };

    const skip = (Number(page) - 1) * Number(limit);

    // Sanitize fields: DO NOT expose phone, email, or internal financial accounts publicly
    const [trainers, total] = await Promise.all([
      Trainer.find(query)
        .select('_id name profilePhoto specialization professionalHeadline experience trainingMode qualifications certifications expertise bio availability availableDays fee paymentType averageRating totalReviews isPublicRecruitment preferredLocation employmentPreference expectedSalary personalTrainingFee portfolioUrl earliestJoiningDate availabilityStatus workHistory')
        .sort(sortObj)
        .skip(skip)
        .limit(Number(limit)),
      Trainer.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      trainers,
      data: trainers,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit))
    });
  } catch (error: any) {
    console.error('Error fetching public trainers:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch trainers', error: error.message });
  }
};

export const getPublicTrainerById = async (req: any, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: 'Invalid trainer ID' });
      return;
    }

    const trainer = await Trainer.findById(id)
      .select('_id name profilePhoto specialization professionalHeadline experience trainingMode qualifications certifications expertise bio availability availableDays fee paymentType averageRating totalReviews isPublicRecruitment preferredLocation employmentPreference expectedSalary personalTrainingFee portfolioUrl earliestJoiningDate availabilityStatus workHistory');

    if (!trainer) {
      res.status(404).json({ success: false, message: 'Trainer profile not found' });
      return;
    }

    res.status(200).json({ success: true, trainer, data: trainer });
  } catch (error: any) {
    console.error('Error fetching trainer details:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch trainer profile', error: error.message });
  }
};

export const getOwnerTrainers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const gym = await resolveGymForOwner(req);
    const gymId = gym?._id;

    const { 
      search, 
      location, 
      expertise, 
      experience, 
      employmentType, 
      salaryMin, 
      salaryMax, 
      availability,
      shortlistedOnly,
      sortBy = 'relevance'
    } = req.query;

    const query: any = { 
      status: { $in: ['Active', 'Pending'] },
      $or: [
        { isPublicRecruitment: true },
        { isPublicRecruitment: { $exists: false } }
      ]
    };

    if (shortlistedOnly === 'true' && gymId) {
      query.shortlistedByGyms = gymId;
    }

    if (search && typeof search === 'string') {
      const term = search.trim();
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { name: { $regex: term, $options: 'i' } },
          { specialization: { $regex: term, $options: 'i' } },
          { professionalHeadline: { $regex: term, $options: 'i' } },
          { expertise: { $regex: term, $options: 'i' } }
        ]
      });
    }

    if (location && typeof location === 'string' && location !== 'all') {
      query.preferredLocation = { $regex: location.trim(), $options: 'i' };
    }

    if (experience && typeof experience === 'string' && experience !== 'all') {
      const expNum = parseInt(experience, 10);
      if (!isNaN(expNum)) {
        query.experience = { $gte: expNum };
      }
    }

    let sortObj: any = { createdAt: -1 };
    if (sortBy === 'experience') sortObj = { experience: -1 };
    else if (sortBy === 'salaryLow') sortObj = { expectedSalary: 1 };
    else if (sortBy === 'salaryHigh') sortObj = { expectedSalary: -1 };
    else if (sortBy === 'rating') sortObj = { averageRating: -1 };

    const trainers = await Trainer.find(query)
      .populate('userId', 'city mobile resumeUrl certificationUrl previousGym profilePhoto qualification certifications specialization')
      .sort(sortObj);

    // Map shortlisted flag for this owner's gym
    const mapped = trainers.map(t => {
      const isShortlisted = gymId && t.shortlistedByGyms?.some(id => id.toString() === gymId.toString());
      const u = (t.userId as any) || {};
      return {
        ...t.toObject(),
        isShortlisted: !!isShortlisted,
        city: u.city || t.preferredLocation || '',
        phone: t.phone || u.mobile || '',
        resumeUrl: t.resumeUrl || u.resumeUrl || '',
        certificationUrl: t.certificationUrl || u.certificationUrl || '',
        previousGym: t.previousGym || u.previousGym || '',
        qualifications: t.qualifications || u.qualification || '',
        certifications: t.certifications || u.certifications || '',
        profilePhoto: t.profilePhoto || u.profilePhoto || '',
        availability: t.availability || t.earliestJoiningDate || 'Immediately'
      };
    });

    res.status(200).json({ success: true, trainers: mapped, data: mapped });
  } catch (error: any) {
    console.error('Error fetching owner candidate trainers:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch candidate trainers', error: error.message });
  }
};

export const toggleShortlistTrainer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const gym = await resolveGymForOwner(req);
    if (!gym) {
      res.status(403).json({ success: false, message: 'Gym not found for owner' });
      return;
    }

    const trainer = await Trainer.findById(id);
    if (!trainer) {
      res.status(404).json({ success: false, message: 'Trainer not found' });
      return;
    }

    trainer.shortlistedByGyms = trainer.shortlistedByGyms || [];
    const index = trainer.shortlistedByGyms.findIndex(gId => gId.toString() === gym._id.toString());
    let isShortlisted = false;
    if (index > -1) {
      trainer.shortlistedByGyms.splice(index, 1);
      isShortlisted = false;
    } else {
      trainer.shortlistedByGyms.push(gym._id);
      isShortlisted = true;
    }
    await trainer.save();

    res.status(200).json({ success: true, message: isShortlisted ? 'Trainer shortlisted' : 'Trainer removed from shortlist', isShortlisted });
  } catch (error: any) {
    console.error('Error toggling shortlist:', error);
    res.status(500).json({ success: false, message: 'Failed to update shortlist status', error: error.message });
  }
};

export const createHiringRequest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const gym = await resolveGymForOwner(req);
    if (!gym) {
      res.status(403).json({ success: false, message: 'Gym not found for authenticated owner' });
      return;
    }

    const {
      trainerId,
      role,
      employmentType,
      offeredCompensation,
      personalTrainingFee,
      workingHours,
      jobResponsibilities,
      requiredExpertise,
      expectedJoiningDate,
      additionalTerms,
      message
    } = req.body;

    if (!trainerId || !role || !employmentType || !offeredCompensation || !jobResponsibilities || !expectedJoiningDate) {
      res.status(400).json({ success: false, message: 'All required hiring request fields must be provided' });
      return;
    }

    const trainer = await Trainer.findById(trainerId);
    if (!trainer) {
      res.status(404).json({ success: false, message: 'Target trainer not found' });
      return;
    }

    // Business Rule: Prevent duplicate active hiring requests from the same gym to the same trainer for the same role
    const existingActiveRequest = await HiringRequest.findOne({
      gymId: gym._id,
      trainerId: trainer._id,
      role: role.trim(),
      status: { $in: ['Pending', 'Negotiating', 'Accepted'] }
    });

    if (existingActiveRequest) {
      res.status(400).json({ 
        success: false, 
        message: `An active hiring request for the role "${role}" already exists with this trainer. Please wait for response or close the previous request.` 
      });
      return;
    }

    const hiringRequest = await HiringRequest.create({
      gymId: gym._id,
      trainerId: trainer._id,
      trainerUserId: trainer.userId,
      createdBy: new mongoose.Types.ObjectId(req.user?.id),
      gymName: gym.name,
      gymLocation: gym.location?.address ? `${gym.location.address}, ${gym.location.city || ''}`.trim() : (gym.location?.city || 'Bangalore'),
      trainerName: trainer.name,
      trainerEmail: trainer.email,
      trainerPhone: trainer.phone,
      role: role.trim(),
      employmentType,
      offeredCompensation: Number(offeredCompensation),
      personalTrainingFee: Number(personalTrainingFee || 0),
      workingHours,
      jobResponsibilities,
      requiredExpertise: requiredExpertise || trainer.specialization,
      expectedJoiningDate,
      additionalTerms,
      message,
      status: 'Pending',
      negotiationHistory: []
    });

    // Notify Trainer
    try {
      if (trainer.userId) {
        await Notification.create({
          recipientId: trainer.userId,
          recipientRole: 'TRAINER',
          gymId: gym._id,
          title: '💼 New Direct Hiring Request!',
          message: `${gym.name} has sent you a direct hiring request for the position of "${role}" with offered compensation of ₹${Number(offeredCompensation).toLocaleString()}.`,
          type: 'info',
          link: '/trainer/hiring-requests'
        });
      }
    } catch (nErr) {
      console.error('Notification dispatch error:', nErr);
    }

    res.status(201).json({ 
      success: true, 
      message: 'Hiring request successfully sent to trainer!', 
      hiringRequest,
      data: hiringRequest 
    });
  } catch (error: any) {
    console.error('Error creating hiring request:', error);
    res.status(500).json({ success: false, message: 'Failed to send hiring request', error: error.message });
  }
};

export const getOwnerHiringRequests = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const gym = await resolveGymForOwner(req);
    if (!gym) {
      res.status(403).json({ success: false, message: 'Gym not found' });
      return;
    }

    const requests = await HiringRequest.find({ gymId: gym._id })
      .populate('trainerId', 'name email phone profilePhoto specialization experience qualifications certifications')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, requests, data: requests });
  } catch (error: any) {
    console.error('Error fetching owner hiring requests:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch hiring requests', error: error.message });
  }
};

export const confirmHiringRequest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const gym = await resolveGymForOwner(req);
    if (!gym) {
      res.status(403).json({ success: false, message: 'Gym not found' });
      return;
    }

    const hiringReq = await HiringRequest.findOne({ _id: id, gymId: gym._id });
    if (!hiringReq) {
      res.status(404).json({ success: false, message: 'Hiring request not found' });
      return;
    }

    if (hiringReq.status !== 'Accepted') {
      res.status(400).json({ success: false, message: 'Hiring request must be accepted by the trainer before final confirmation' });
      return;
    }

    hiringReq.status = 'Confirmed';
    hiringReq.confirmedAt = new Date();
    hiringReq.confirmedBy = new mongoose.Types.ObjectId(req.user?.id);
    await hiringReq.save();

    // Associate trainer with gym in existing gym trainer-management system
    try {
      const existingTrainerRecord = await Trainer.findOne({ 
        gymId: gym._id, 
        userId: hiringReq.trainerUserId 
      });

      if (!existingTrainerRecord) {
        // Find candidate details
        const sourceTrainer = await Trainer.findById(hiringReq.trainerId);
        await Trainer.create({
          gymId: gym._id,
          userId: hiringReq.trainerUserId || sourceTrainer?.userId,
          name: hiringReq.trainerName,
          email: hiringReq.trainerEmail || sourceTrainer?.email || 'trainer@gymora.com',
          phone: hiringReq.trainerPhone || sourceTrainer?.phone,
          profilePhoto: sourceTrainer?.profilePhoto,
          specialization: hiringReq.role || sourceTrainer?.specialization,
          experience: sourceTrainer?.experience || 3,
          trainingMode: sourceTrainer?.trainingMode || 'both',
          qualifications: sourceTrainer?.qualifications,
          certifications: sourceTrainer?.certifications,
          expertise: hiringReq.requiredExpertise || sourceTrainer?.expertise,
          bio: sourceTrainer?.bio,
          fee: hiringReq.personalTrainingFee || sourceTrainer?.fee || 500,
          paymentType: 'Per Month',
          status: 'Active',
          availabilityStatus: 'Online'
        });
      } else {
        existingTrainerRecord.status = 'Active';
        existingTrainerRecord.specialization = hiringReq.role;
        if (hiringReq.personalTrainingFee) existingTrainerRecord.fee = hiringReq.personalTrainingFee;
        await existingTrainerRecord.save();
      }

      // Also ensure User's gymId is associated if not set
      if (hiringReq.trainerUserId) {
        const u = await User.findById(hiringReq.trainerUserId);
        if (u && !u.gymId) {
          u.gymId = gym._id;
          await u.save();
        }
      }
    } catch (assocErr) {
      console.error('Error connecting hired trainer to gym record:', assocErr);
    }

    // Notify Trainer
    try {
      if (hiringReq.trainerUserId) {
        await Notification.create({
          recipientId: hiringReq.trainerUserId,
          recipientRole: 'TRAINER',
          gymId: gym._id,
          title: '🎉 Employment Confirmed!',
          message: `${gym.name} has confirmed your final hiring terms for "${hiringReq.role}". Welcome to the team!`,
          type: 'success',
          link: '/trainer/hiring-requests'
        });
      }
    } catch (nErr) {
      console.error('Notification dispatch error:', nErr);
    }

    res.status(200).json({ success: true, message: 'Hiring successfully confirmed! Trainer has been added to your gym roster.', hiringRequest: hiringReq });
  } catch (error: any) {
    console.error('Error confirming hiring request:', error);
    res.status(500).json({ success: false, message: 'Failed to confirm hiring terms', error: error.message });
  }
};

export const ownerNegotiateHiringRequest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { proposedSalary, proposedPtFee, proposedTerms, message } = req.body;
    const gym = await resolveGymForOwner(req);
    if (!gym) {
      res.status(403).json({ success: false, message: 'Gym not found' });
      return;
    }

    const hiringReq = await HiringRequest.findOne({ _id: id, gymId: gym._id });
    if (!hiringReq) {
      res.status(404).json({ success: false, message: 'Hiring request not found' });
      return;
    }

    hiringReq.status = 'Negotiating';
    if (proposedSalary) hiringReq.offeredCompensation = Number(proposedSalary);
    if (proposedPtFee) hiringReq.personalTrainingFee = Number(proposedPtFee);
    if (proposedTerms) hiringReq.additionalTerms = proposedTerms;

    hiringReq.negotiationHistory.push({
      senderRole: 'GYM_OWNER',
      senderId: new mongoose.Types.ObjectId(req.user?.id),
      proposedSalary: proposedSalary ? Number(proposedSalary) : undefined,
      proposedPtFee: proposedPtFee ? Number(proposedPtFee) : undefined,
      proposedTerms,
      message,
      timestamp: new Date()
    });

    await hiringReq.save();

    // Notify Trainer
    try {
      if (hiringReq.trainerUserId) {
        await Notification.create({
          recipientId: hiringReq.trainerUserId,
          recipientRole: 'TRAINER',
          gymId: gym._id,
          title: '💬 Counter-Terms Received from Gym',
          message: `${gym.name} has submitted updated compensation terms for the role "${hiringReq.role}".`,
          type: 'alert',
          link: '/trainer/hiring-requests'
        });
      }
    } catch (nErr) {
      console.error('Notification error:', nErr);
    }

    res.status(200).json({ success: true, message: 'Negotiation proposal sent to trainer', hiringRequest: hiringReq });
  } catch (error: any) {
    console.error('Error negotiating hiring request:', error);
    res.status(500).json({ success: false, message: 'Failed to submit negotiation terms', error: error.message });
  }
};

export const getTrainerHiringRequests = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const trainerUser = req.user;
    if (!trainerUser?.id) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    // Find by trainerUserId or trainer doc's userId
    const trainerDocs = await Trainer.find({ userId: trainerUser.id });
    const trainerIds = trainerDocs.map(t => t._id);

    const requests = await HiringRequest.find({
      $or: [
        { trainerUserId: trainerUser.id },
        { trainerId: { $in: trainerIds } }
      ]
    })
      .populate('gymId', 'name address city logo profilePhoto rating phone email')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, requests, data: requests });
  } catch (error: any) {
    console.error('Error fetching trainer hiring requests:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch hiring requests', error: error.message });
  }
};

export const respondToHiringRequest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { action, proposedSalary, proposedPtFee, proposedTerms, message, declineReason } = req.body;
    const trainerUser = req.user;

    const hiringReq = await HiringRequest.findById(id).populate('gymId');
    if (!hiringReq) {
      res.status(404).json({ success: false, message: 'Hiring request not found' });
      return;
    }

    if (action === 'ACCEPT') {
      hiringReq.status = 'Accepted';
      await hiringReq.save();

      // Notify Gym Owner to confirm final terms
      try {
        const gym = (hiringReq.gymId as any);
        if (gym?.ownerId) {
          await Notification.create({
            recipientId: gym.ownerId,
            recipientRole: 'GYM_OWNER',
            gymId: gym._id,
            title: '🎉 Trainer Accepted Your Hiring Request!',
            message: `${hiringReq.trainerName} has accepted your hiring request for "${hiringReq.role}". Please review and confirm final hiring terms.`,
            type: 'success',
            link: '/admin/hiring/requests'
          });
        }
      } catch (nErr) {
        console.error('Notification error:', nErr);
      }

      res.status(200).json({ success: true, message: 'You have accepted the hiring request! Waiting for gym owner confirmation.', hiringRequest: hiringReq });
    } else if (action === 'REJECT') {
      hiringReq.status = 'Rejected';
      hiringReq.declineReason = declineReason || 'Declined by trainer';
      await hiringReq.save();

      try {
        const gym = (hiringReq.gymId as any);
        if (gym?.ownerId) {
          await Notification.create({
            recipientId: gym.ownerId,
            recipientRole: 'GYM_OWNER',
            gymId: gym._id,
            title: 'Hiring Request Declined',
            message: `${hiringReq.trainerName} has declined the hiring request for "${hiringReq.role}".`,
            type: 'alert',
            link: '/admin/hiring/requests'
          });
        }
      } catch (nErr) {
        console.error('Notification error:', nErr);
      }

      res.status(200).json({ success: true, message: 'You have declined the hiring request', hiringRequest: hiringReq });
    } else if (action === 'NEGOTIATE') {
      hiringReq.status = 'Negotiating';
      hiringReq.negotiationHistory.push({
        senderRole: 'TRAINER',
        senderId: new mongoose.Types.ObjectId(trainerUser?.id),
        proposedSalary: proposedSalary ? Number(proposedSalary) : undefined,
        proposedPtFee: proposedPtFee ? Number(proposedPtFee) : undefined,
        proposedTerms,
        message,
        timestamp: new Date()
      });
      await hiringReq.save();

      try {
        const gym = (hiringReq.gymId as any);
        if (gym?.ownerId) {
          await Notification.create({
            recipientId: gym.ownerId,
            recipientRole: 'GYM_OWNER',
            gymId: gym._id,
            title: '⚖️ Trainer Requested Negotiation',
            message: `${hiringReq.trainerName} proposed counter-terms for the role "${hiringReq.role}": ₹${Number(proposedSalary || hiringReq.offeredCompensation).toLocaleString()}.`,
            type: 'alert',
            link: '/admin/hiring/requests'
          });
        }
      } catch (nErr) {
        console.error('Notification error:', nErr);
      }

      res.status(200).json({ success: true, message: 'Counter-terms sent to gym owner for negotiation', hiringRequest: hiringReq });
    } else {
      res.status(400).json({ success: false, message: 'Invalid response action (ACCEPT, REJECT, NEGOTIATE)' });
    }
  } catch (error: any) {
    console.error('Error responding to hiring request:', error);
    res.status(500).json({ success: false, message: 'Failed to process response', error: error.message });
  }
};

export const getTrainerRecruitmentProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const trainer = await Trainer.findOne({ userId: req.user?.id });
    if (!trainer) {
      res.status(404).json({ success: false, message: 'Trainer profile not found' });
      return;
    }
    res.status(200).json({ success: true, trainer, data: trainer });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch recruitment profile', error: error.message });
  }
};

export const updateTrainerRecruitmentProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const trainer = await Trainer.findOne({ userId: req.user?.id });
    if (!trainer) {
      res.status(404).json({ success: false, message: 'Trainer profile not found' });
      return;
    }

    const {
      professionalHeadline,
      bio,
      specialization,
      expertise,
      experience,
      preferredLocation,
      employmentPreference,
      expectedSalary,
      personalTrainingFee,
      earliestJoiningDate,
      isPublicRecruitment,
      portfolioUrl,
      workHistory
    } = req.body;

    if (professionalHeadline !== undefined) trainer.professionalHeadline = professionalHeadline;
    if (bio !== undefined) trainer.bio = bio;
    if (specialization !== undefined) trainer.specialization = specialization;
    if (expertise !== undefined) trainer.expertise = expertise;
    if (experience !== undefined) trainer.experience = Number(experience);
    if (preferredLocation !== undefined) trainer.preferredLocation = preferredLocation;
    if (employmentPreference !== undefined) trainer.employmentPreference = employmentPreference;
    if (expectedSalary !== undefined) trainer.expectedSalary = Number(expectedSalary);
    if (personalTrainingFee !== undefined) trainer.personalTrainingFee = Number(personalTrainingFee);
    if (earliestJoiningDate !== undefined) trainer.earliestJoiningDate = earliestJoiningDate;
    if (isPublicRecruitment !== undefined) trainer.isPublicRecruitment = Boolean(isPublicRecruitment);
    if (portfolioUrl !== undefined) trainer.portfolioUrl = portfolioUrl;
    if (workHistory !== undefined) trainer.workHistory = workHistory;

    await trainer.save();
    res.status(200).json({ success: true, message: 'Recruitment profile updated successfully', trainer });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update recruitment profile', error: error.message });
  }
};
