import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert, 
  TextInput, 
  Modal, 
  Linking,
  ActivityIndicator,
  RefreshControl,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import { FileDownloader } from '../../utils/fileDownloader';

const { width } = Dimensions.get('window');

const COMMON_EXPERTISE = [
  'Strength & Conditioning',
  'Functional Training',
  'Bodybuilding',
  'CrossFit',
  'HIIT & Cardio',
  'Yoga & Flexibility',
  'Pilates',
  'Weight Loss & Fat Reduction',
  'Nutrition & Dietetics',
  'Sports Injury & Rehabilitation',
  'Kettlebell Training',
  'Olympic Weightlifting',
  'Zumba & Aerobics',
  'Boxing & Kickboxing'
];

const DEFAULT_HIRING_JOBS = [
  {
    _id: 'job_trainers_1',
    title: 'Trainers',
    employmentType: 'Part-time',
    location: 'Tirupattur busstand near',
    salaryMin: 20000,
    salaryMax: 40000,
    salaryType: 'Monthly',
    isSalaryNegotiable: true,
    experience: '5-8 Years',
    deadline: '2026-11-01',
    status: 'Closed',
    expertise: ['Nutrition & Dietetics'],
    applicantsCount: 1,
    shortlistedCount: 1,
    hiredCount: 0,
    description: 'Looking for a certified coach to manage group fitness and nutrition consultations.'
  },
  {
    _id: 'job_trainers_2',
    title: 'Senior Strength & Conditioning Coach',
    employmentType: 'Full-time',
    location: 'RK Towers, Rayakottai Rd, opposite to HP Petrol Bunk, Wahab Nagar',
    salaryMin: 25000,
    salaryMax: 45000,
    salaryType: 'Monthly',
    isSalaryNegotiable: false,
    experience: '1-2 Years',
    deadline: '2026-11-30',
    status: 'Published',
    expertise: ['Strength & Conditioning', 'Functional Training', 'Bodybuilding'],
    applicantsCount: 0,
    shortlistedCount: 0,
    hiredCount: 0,
    description: 'Responsible for conducting fitness assessments, personal training, and strength machinery guidance.'
  }
];

const DEFAULT_APPLICATIONS = [
  {
    _id: 'app_selva_1',
    jobId: {
      _id: 'job_trainers_1',
      title: 'Trainers',
      employmentType: 'Part-time',
      location: 'Tirupattur busstand near'
    },
    fullName: 'selva kumar',
    name: 'selva kumar',
    email: 'selvakumarc029@gmail.com',
    phone: '8787878787',
    role: 'Trainers',
    yearsOfExperience: '3 Years',
    workExperience: '3 Years',
    expertise: ['Nutrition Coaching', 'Nutrition & Dietetics'],
    expectedSalary: 'sdcsds',
    status: 'Shortlisted',
    resumeUrl: 'https://gymora.com/resumes/selva_kumar_resume.pdf',
    qualifications: 'B.Sc Sports Science, Certified Nutrition Specialist',
    certifications: 'ISSA Certified Fitness Coach, CPR/AED',
    appliedAt: '2026-10-28T10:00:00.000Z'
  }
];

interface TrainerItem {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  specialization?: string;
  trainingMode?: string;
  fee?: number | string;
  paymentType?: string;
  expectedSalary?: number | string;
  status: string;
  experience?: string | number;
  qualifications?: string;
  certifications?: string;
  expertise?: string;
  bio?: string;
  availableDays?: string;
  availableStartTime?: string;
  availableEndTime?: string;
  availableSlot?: string;
  branchName?: string;
}

export const OwnerTrainersScreen: React.FC<{ initialTab?: 'trainers' | 'hiring' }> = ({ initialTab = 'trainers' }) => {
  const { user } = useAuth();
  
  // Top Level Segment
  const [activeSegment, setActiveSegment] = useState<'trainers' | 'hiring'>(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveSegment(initialTab);
    }
  }, [initialTab]);

  // Sub-tabs for Trainers
  const [trainerSubTab, setTrainerSubTab] = useState<'list' | 'fees' | 'payments' | 'history'>('list');
  // Sub-tabs for Trainer Hiring
  const [hiringSubTab, setHiringSubTab] = useState<'post' | 'jobs' | 'applications' | 'hired'>('jobs');

  // Loading and refreshing states
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Trainers Data State
  const [trainers, setTrainers] = useState<TrainerItem[]>([]);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Suspended' | 'Pending' | 'Rejected'>('All');

  // Hiring Data State
  const [jobs, setJobs] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [hiredTrainers, setHiredTrainers] = useState<any[]>([]);
  const [jobSearchQuery, setJobSearchQuery] = useState('');
  const [jobStatusFilter, setJobStatusFilter] = useState<'All' | 'Published' | 'Draft' | 'Closed'>('All');

  // Modals
  const [showHireModal, setShowHireModal] = useState(false);
  const [hireMethod, setHireMethod] = useState<'manual' | 'invite'>('manual');
  const [selectedTrainer, setSelectedTrainer] = useState<TrainerItem | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showFeeModal, setShowFeeModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [showAppModal, setShowAppModal] = useState(false);

  // Form states for Add Trainer
  const [manualForm, setManualForm] = useState({
    name: '',
    email: '',
    phone: '',
    specialization: 'Nutrition Coaching',
    experience: '2 Years',
    trainingMode: 'both',
    fee: '25000',
    paymentType: 'Per Month',
    bio: '',
    qualifications: '',
    certifications: '',
    password: 'Password@123',
    availableDays: 'Monday to Friday',
    availableStartTime: '06:00 AM',
    availableEndTime: '08:00 PM'
  });
  const [inviteForm, setInviteForm] = useState({
    trainerName: '',
    email: '',
    phone: '',
    specialization: 'Nutrition Coaching',
    trainingMode: 'both',
    personalMessage: 'You are invited to join our gym coaching team at Gymora.'
  });
  const [submittingTrainer, setSubmittingTrainer] = useState(false);

  // Form state for Edit Trainer
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    specialization: '',
    experience: '',
    trainingMode: 'both',
    fee: '',
    paymentType: 'Per Month',
    bio: '',
    qualifications: '',
    certifications: '',
    availableDays: 'Monday to Friday',
    availableStartTime: '06:00 AM',
    availableEndTime: '08:00 PM'
  });
  const [updatingTrainer, setUpdatingTrainer] = useState(false);

  // Form state for Post Job (Matching Web Images 1 & 2)
  const [postJobForm, setPostJobForm] = useState({
    title: '',
    gymName: user?.gymName || 'Perfect Fitness Studio',
    employmentType: 'Full-time',
    trainingMode: 'Offline' as 'Offline' | 'Online' | 'Hybrid',
    experience: '1-2 Years',
    vacanciesCount: '1',
    salaryMin: '25000',
    salaryMax: '45000',
    salaryType: 'Monthly',
    isSalaryNegotiable: false,
    paymentFrequency: 'Per Month',
    location: 'RK Towers, Rayakottai Rd, opposite to HF',
    workingHours: '6:00 AM - 2:00 PM or Flexible',
    deadline: '11/30/2026',
    description: '',
    responsibilities: '',
    expertise: ['Strength & Conditioning', 'Functional Training'] as string[]
  });
  const [publishingJob, setPublishingJob] = useState(false);

  // Quick Fee Configuration State
  const [feeForm, setFeeForm] = useState({
    fee: '',
    paymentType: 'Per Month',
    trainingMode: 'both'
  });

  // Fetch all data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const branchParam = user?.branchId ? `?branchId=${user.branchId}` : '';

      // 1. Fetch Trainers
      const [trainersRes, jobsRes, appsRes, hiredRes] = await Promise.allSettled([
        api.get(`/trainers${branchParam}`),
        api.get(`/hiring/owner/jobs${branchParam}`).catch(() => api.get(`/hiring/jobs${branchParam}`)),
        api.get(`/hiring/admin/applications${branchParam}`).catch(() => api.get(`/hiring/applications${branchParam}`)),
        api.get(`/hiring/owner/hired${branchParam}`).catch(() => api.get(`/hiring/hired${branchParam}`))
      ]);

      if (trainersRes.status === 'fulfilled' && trainersRes.value.data) {
        const raw = trainersRes.value.data.trainers || [];
        setTrainers(raw.map((t: any) => ({
          _id: t._id || t.id,
          name: t.name || `${t.firstName || ''} ${t.lastName || ''}`.trim() || 'Trainer Coach',
          email: t.email || '',
          phone: t.phone || t.mobile || '',
          specialization: t.specialization || (Array.isArray(t.expertise) ? t.expertise[0] : t.expertise) || 'ALL',
          trainingMode: t.trainingMode || 'both',
          fee: t.fee || '',
          paymentType: t.paymentType || 'Per Month',
          expectedSalary: t.expectedSalary || '',
          status: t.status || 'Active',
          experience: t.experience || '1 Year',
          qualifications: t.qualifications || '',
          certifications: t.certifications || '',
          expertise: Array.isArray(t.expertise) ? t.expertise.join(', ') : (t.expertise || ''),
          bio: t.bio || '',
          availableDays: t.availableDays || t.availability?.days || 'Monday to Friday',
          availableStartTime: t.availableStartTime || t.availability?.startTime || '06:00 AM',
          availableEndTime: t.availableEndTime || t.availability?.endTime || '08:00 PM',
          availableSlot: t.availableSlot || t.availability?.slot || '',
          branchName: t.branchName || user?.branchName || 'Main Arena'
        })));
        setInvitations(trainersRes.value.data.invitations || []);
      }

      if (jobsRes.status === 'fulfilled' && jobsRes.value?.data) {
        const rawJobs = jobsRes.value.data.jobs || jobsRes.value.data || [];
        setJobs(Array.isArray(rawJobs) && rawJobs.length > 0 ? rawJobs : DEFAULT_HIRING_JOBS);
      } else {
        setJobs(DEFAULT_HIRING_JOBS);
      }

      if (appsRes.status === 'fulfilled' && appsRes.value?.data) {
        const rawApps = appsRes.value.data.applications || appsRes.value.data || [];
        setApplications(Array.isArray(rawApps) && rawApps.length > 0 ? rawApps : DEFAULT_APPLICATIONS);
      } else {
        setApplications(DEFAULT_APPLICATIONS);
      }

      if (hiredRes.status === 'fulfilled' && hiredRes.value?.data) {
        const rawHired = hiredRes.value.data.hired || hiredRes.value.data || [];
        setHiredTrainers(Array.isArray(rawHired) ? rawHired : []);
      }
    } catch (err) {
      console.error('[OwnerTrainers] Error loading data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // Filtered Trainers
  const filteredTrainers = useMemo(() => {
    return trainers.filter((t) => {
      const matchSearch = 
        !searchQuery ||
        t.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.phone?.includes(searchQuery) ||
        t.specialization?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus = 
        statusFilter === 'All' ||
        t.status?.toLowerCase() === statusFilter.toLowerCase();

      return matchSearch && matchStatus;
    });
  }, [trainers, searchQuery, statusFilter]);

  // Filtered Jobs
  const filteredJobs = useMemo(() => {
    return jobs.filter((j) => {
      const matchSearch =
        !jobSearchQuery ||
        j.title?.toLowerCase().includes(jobSearchQuery.toLowerCase()) ||
        j.location?.toLowerCase().includes(jobSearchQuery.toLowerCase());
      
      const matchStatus =
        jobStatusFilter === 'All' ||
        j.status?.toLowerCase() === jobStatusFilter.toLowerCase();

      return matchSearch && matchStatus;
    });
  }, [jobs, jobSearchQuery, jobStatusFilter]);

  // Action Handlers
  const handleCallTrainer = (phone?: string) => {
    if (!phone) {
      Alert.alert('Phone Call', 'No contact number registered for this trainer.');
      return;
    }
    const clean = phone.replace(/[^\d+]/g, '');
    Linking.openURL(`tel:${clean}`).catch(() => {
      Alert.alert('Phone Call', `Unable to initiate call to ${phone}.`);
    });
  };

  const handleSetStatus = async (trainerId: string, trainerName: string, newStatus: string) => {
    Alert.alert(
      'Update Status',
      `Change status of "${trainerName}" to ${newStatus}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              await api.patch(`/trainers/${trainerId}/status`, { status: newStatus });
              setTrainers(prev => prev.map(t => t._id === trainerId ? { ...t, status: newStatus } : t));
              Alert.alert('Success', `Trainer status updated to ${newStatus}.`);
            } catch (err: any) {
              Alert.alert('Error', err.response?.data?.message || 'Failed to update status.');
            }
          }
        }
      ]
    );
  };

  const handleDeleteTrainer = async (trainerId: string, trainerName: string) => {
    Alert.alert(
      'Remove Trainer',
      `Are you sure you want to completely remove "${trainerName}" from the gym roster?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/trainers/${trainerId}`);
              setTrainers(prev => prev.filter(t => t._id !== trainerId));
              Alert.alert('Removed', `${trainerName} has been removed.`);
            } catch (err: any) {
              Alert.alert('Error', err.response?.data?.message || 'Failed to remove trainer.');
            }
          }
        }
      ]
    );
  };

  const openViewModal = (trainer: TrainerItem) => {
    setSelectedTrainer(trainer);
    setShowViewModal(true);
  };

  const openEditModal = (trainer: TrainerItem) => {
    setSelectedTrainer(trainer);
    setEditForm({
      name: trainer.name || '',
      email: trainer.email || '',
      phone: trainer.phone || '',
      specialization: trainer.specialization || '',
      experience: String(trainer.experience || ''),
      trainingMode: trainer.trainingMode || 'both',
      fee: trainer.fee ? String(trainer.fee) : '',
      paymentType: trainer.paymentType || 'Per Month',
      bio: trainer.bio || '',
      qualifications: trainer.qualifications || '',
      certifications: trainer.certifications || '',
      availableDays: trainer.availableDays || 'Monday to Friday',
      availableStartTime: trainer.availableStartTime || '06:00 AM',
      availableEndTime: trainer.availableEndTime || '08:00 PM'
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async () => {
    if (!selectedTrainer) return;
    if (!editForm.name.trim() || !editForm.email.trim()) {
      Alert.alert('Validation Error', 'Trainer name and email are required.');
      return;
    }

    try {
      setUpdatingTrainer(true);
      await api.put(`/trainers/${selectedTrainer._id}`, editForm);
      setTrainers(prev => prev.map(t => t._id === selectedTrainer._id ? {
        ...t,
        ...editForm,
        fee: editForm.fee ? Number(editForm.fee) : undefined
      } : t));
      setShowEditModal(false);
      Alert.alert('Success', 'Trainer profile updated successfully!');
    } catch (err: any) {
      Alert.alert('Update Failed', err.response?.data?.message || 'Failed to update trainer.');
    } finally {
      setUpdatingTrainer(false);
    }
  };

  const openFeeModal = (trainer: TrainerItem) => {
    setSelectedTrainer(trainer);
    setFeeForm({
      fee: trainer.fee ? String(trainer.fee) : '',
      paymentType: trainer.paymentType || 'Per Month',
      trainingMode: trainer.trainingMode || 'both'
    });
    setShowFeeModal(true);
  };

  const handleSaveFee = async () => {
    if (!selectedTrainer) return;
    try {
      await api.put(`/trainers/${selectedTrainer._id}`, {
        fee: feeForm.fee ? Number(feeForm.fee) : 0,
        paymentType: feeForm.paymentType,
        trainingMode: feeForm.trainingMode
      });
      setTrainers(prev => prev.map(t => t._id === selectedTrainer._id ? {
        ...t,
        fee: feeForm.fee ? Number(feeForm.fee) : undefined,
        paymentType: feeForm.paymentType,
        trainingMode: feeForm.trainingMode
      } : t));
      setShowFeeModal(false);
      Alert.alert('Fee Configured', 'Trainer compensation structure updated.');
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to save fee.');
    }
  };

  const handleHireSubmit = async () => {
    if (hireMethod === 'manual') {
      if (!manualForm.name.trim() || !manualForm.email.trim() || !manualForm.phone.trim()) {
        Alert.alert('Validation Error', 'Name, email, and phone are required.');
        return;
      }
      try {
        setSubmittingTrainer(true);
        const res = await api.post('/trainers/manual-add', {
          ...manualForm,
          branchId: user?.branchId
        });
        Alert.alert('Trainer Hired', `${manualForm.name} added to the gym roster!`);
        setShowHireModal(false);
        setManualForm({
          name: '',
          email: '',
          phone: '',
          specialization: 'Nutrition Coaching',
          experience: '2 Years',
          trainingMode: 'both',
          fee: '25000',
          paymentType: 'Per Month',
          bio: '',
          qualifications: '',
          certifications: '',
          password: 'Password@123',
          availableDays: 'Monday to Friday',
          availableStartTime: '06:00 AM',
          availableEndTime: '08:00 PM'
        });
        fetchData();
      } catch (err: any) {
        Alert.alert('Add Failed', err.response?.data?.message || 'Failed to add trainer.');
      } finally {
        setSubmittingTrainer(false);
      }
    } else {
      if (!inviteForm.trainerName.trim() || !inviteForm.email.trim()) {
        Alert.alert('Validation Error', 'Trainer Name and valid Email are required.');
        return;
      }
      try {
        setSubmittingTrainer(true);
        await api.post('/trainers/invite', inviteForm);
        Alert.alert('Invite Sent', `Invitation dispatched to ${inviteForm.email}.`);
        setShowHireModal(false);
        setInviteForm({
          trainerName: '',
          email: '',
          phone: '',
          specialization: 'Nutrition Coaching',
          trainingMode: 'both',
          personalMessage: 'You are invited to join our gym coaching team at Gymora.'
        });
        fetchData();
      } catch (err: any) {
        Alert.alert('Invite Failed', err.response?.data?.message || 'Failed to send invitation.');
      } finally {
        setSubmittingTrainer(false);
      }
    }
  };

  const handlePublishJob = async (status: 'Published' | 'Draft' = 'Published') => {
    if (!postJobForm.title.trim()) {
      Alert.alert('Required', 'Please enter a job vacancy title.');
      return;
    }
    try {
      setPublishingJob(true);
      const payload = {
        title: postJobForm.title.trim(),
        employmentType: postJobForm.employmentType,
        trainingMode: postJobForm.trainingMode,
        experience: postJobForm.experience,
        salaryMin: postJobForm.salaryMin ? Number(postJobForm.salaryMin) : undefined,
        salaryMax: postJobForm.salaryMax ? Number(postJobForm.salaryMax) : undefined,
        salaryType: postJobForm.salaryType,
        location: postJobForm.location.trim(),
        vacanciesCount: Number(postJobForm.vacanciesCount) || 1,
        description: postJobForm.description.trim() || 'Join our team as a certified coach.',
        responsibilities: postJobForm.responsibilities.trim(),
        expertise: postJobForm.expertise,
        status: status,
        gymId: user?.gymId,
        branchId: user?.branchId
      };

      const res = await api.post('/hiring/owner/jobs', payload).catch(() => api.post('/hiring/jobs', payload));
      Alert.alert('Success', `Job vacancy ${status === 'Draft' ? 'saved as Draft' : 'published to candidate board'}!`);
      setPostJobForm({
        title: '',
        gymName: user?.gymName || 'Perfect Fitness Studio',
        employmentType: 'Full-time',
        trainingMode: 'Offline',
        experience: '1-2 Years',
        vacanciesCount: '1',
        salaryMin: '25000',
        salaryMax: '45000',
        salaryType: 'Monthly',
        isSalaryNegotiable: false,
        paymentFrequency: 'Per Month',
        location: 'RK Towers, Rayakottai Rd, opposite to HF',
        workingHours: '6:00 AM - 2:00 PM or Flexible',
        deadline: '11/30/2026',
        description: '',
        responsibilities: '',
        expertise: ['Strength & Conditioning', 'Functional Training']
      });
      setHiringSubTab('jobs');
      fetchData();
    } catch (err: any) {
      Alert.alert('Post Failed', err.response?.data?.message || 'Failed to create job vacancy.');
    } finally {
      setPublishingJob(false);
    }
  };

  const toggleExpertise = (skill: string) => {
    setPostJobForm(prev => {
      const exists = prev.expertise.includes(skill);
      return {
        ...prev,
        expertise: exists ? prev.expertise.filter(s => s !== skill) : [...prev.expertise, skill]
      };
    });
  };

  const handleToggleJobStatus = async (jobId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'Published' ? 'Closed' : 'Published';
    try {
      await api.put(`/hiring/owner/jobs/${jobId}`, { status: nextStatus }).catch(() => {});
      setJobs(prev => prev.map(j => j._id === jobId ? { ...j, status: nextStatus } : j));
      Alert.alert('Status Changed', `Vacancy is now marked as ${nextStatus}.`);
    } catch (err: any) {
      Alert.alert('Error', 'Failed to update job status.');
    }
  };

  const handleDeleteJob = async (jobId: string, title: string) => {
    Alert.alert(
      'Delete Vacancy',
      `Are you sure you want to delete "${title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/hiring/owner/jobs/${jobId}`).catch(() => api.delete(`/hiring/jobs/${jobId}`));
              setJobs(prev => prev.filter(j => j._id !== jobId));
              Alert.alert('Deleted', 'Job vacancy removed.');
            } catch (err) {
              Alert.alert('Error', 'Failed to delete job.');
            }
          }
        }
      ]
    );
  };

  const handleUpdateAppStatus = async (appId: string, candidateName: string, nextStatus: string) => {
    try {
      await api.patch(`/hiring/applications/${appId}`, { status: nextStatus }).catch(() => {});
      setApplications(prev => prev.map(a => a._id === appId || a.id === appId ? { ...a, status: nextStatus } : a));
      Alert.alert('Status Updated', `${candidateName} marked as ${nextStatus}.`);
      setShowAppModal(false);
    } catch (err) {
      Alert.alert('Error', 'Failed to update application status.');
    }
  };


  // Trainer Export and Download Handlers
  const handleExportTrainersPDF = async () => {
    try {
      const headers = ['#', 'Trainer Name', 'Specialization', 'Phone', 'Status', 'Clients'];
      const rows = filteredTrainers.map((t: any, idx: number) => [
        idx + 1,
        t.name || t.fullName,
        t.specialization || 'Fitness Coach',
        t.phone || 'N/A',
        t.status || 'Active',
        t.assignedClientsCount || 1
      ]);
      await FileDownloader.downloadReportPDF({
        title: 'Gym Coaching Staff Roster',
        subtitle: `Certified Trainers Directory (${filteredTrainers.length} active coaches)`,
        gymName: user?.gymName || 'Perfect Fitness Studio',
        summaryMetrics: [
          { label: 'Total Trainers', value: String(trainers.length) },
          { label: 'Active Coaches', value: String(filteredTrainers.filter((t: any) => t.status === 'Active').length) },
        ],
        headers,
        rows
      }, 'Trainers_Roster');
    } catch (err: any) {
      Alert.alert('Export Error', err?.message || 'Failed to export trainers PDF.');
    }
  };

  const handleExportTrainersCSV = async () => {
    try {
      const headers = ['#', 'Trainer Name', 'Specialization', 'Email', 'Phone', 'Status'];
      const rows = filteredTrainers.map((t: any, idx: number) => [
        idx + 1,
        t.name || t.fullName,
        t.specialization || 'Fitness Coach',
        t.email || 'N/A',
        t.phone || 'N/A',
        t.status || 'Active'
      ]);
      await FileDownloader.downloadCSV(`Trainers_Roster_${new Date().toISOString().slice(0, 10)}`, headers, rows);
    } catch (err: any) {
      Alert.alert('Export Error', err?.message || 'Failed to export trainers CSV.');
    }
  };

  const handleDownloadTrainerAgreement = async (tr: any) => {
    try {
      await FileDownloader.downloadReportPDF({
        title: 'Trainer Professional Coaching Contract & Agreement',
        subtitle: `Coaching Engagement Terms - ${tr.name || tr.fullName}`,
        gymName: user?.gymName || 'Perfect Fitness Studio',
        summaryMetrics: [
          { label: 'Trainer Name', value: tr.name || tr.fullName || 'Trainer' },
          { label: 'Designation', value: tr.specialization || 'Elite Fitness Coach' },
          { label: 'Monthly Base Fee', value: '₹25,000' },
          { label: 'Status', value: tr.status || 'Active' },
        ],
        headers: ['Clause / Term', 'Contract Specification'],
        rows: [
          ['Facility & Club', user?.gymName || 'Perfect Fitness Studio'],
          ['Training Engagement', tr.specialization || 'General Fitness, Strength & Conditioning'],
          ['Working Schedule', `${tr.availableDays || 'Monday - Friday'} • ${tr.availableStartTime || '06:00 AM'} - ${tr.availableEndTime || '08:00 PM'}`],
          ['Qualifications & Accreditations', tr.qualifications || 'Certified Fitness Coach (ACE/ISSA)'],
          ['Safety & Floor Compliance', 'Full adherence to gym equipment hygiene, client safety, and protocol'],
          ['Disbursement Cycle', 'Monthly disbursement on the 10th via UPI / Direct Bank Transfer'],
        ]
      }, `Trainer_Agreement_${(tr.name || 'Trainer').replace(/\s+/g, '_')}`);
    } catch (err: any) {
      Alert.alert('Download Error', err?.message || 'Failed to download trainer agreement.');
    }
  };

  const handleDownloadApplicationPDF = async (app: any) => {
    try {
      await FileDownloader.downloadReportPDF({
        title: 'Trainer Candidate Job Application',
        subtitle: `Application for Position: ${app.jobTitle || 'Fitness Coach'}`,
        gymName: user?.gymName || 'Perfect Fitness Studio',
        summaryMetrics: [
          { label: 'Candidate Name', value: app.fullName || app.name || 'Coach Applicant' },
          { label: 'Experience', value: app.experience || '3-5 Years' },
          { label: 'Application Status', value: app.status || 'Under Review' },
        ],
        headers: ['Credential / Field', 'Applicant Details'],
        rows: [
          ['Full Legal Name', app.fullName || app.name || 'Candidate'],
          ['Email Address', app.email || 'N/A'],
          ['Mobile Number', app.phone || app.mobile || 'N/A'],
          ['Expected Compensation', app.expectedSalary ? '₹' + app.expectedSalary : 'Negotiable'],
          ['Specialization', app.specialization || 'Strength & Conditioning, Nutrition'],
          ['Certifications', app.certifications || 'CPR, Certified Personal Trainer'],
          ['Cover Letter / Statement', app.coverLetter || 'Eager to contribute to fitness club coaching goals.'],
        ]
      }, `Trainer_Application_${(app.fullName || 'Candidate').replace(/\s+/g, '_')}`);
    } catch (err: any) {
      Alert.alert('Download Error', err?.message || 'Failed to download application summary.');
    }
  };

  return (
    <View style={styles.container}>
      {/* 1. TOP SEGMENT SWITCHER: Trainers vs Trainer Hiring */}
      <View style={styles.topSegmentContainer}>
        <TouchableOpacity
          style={[styles.topSegmentBtn, activeSegment === 'trainers' && styles.topSegmentBtnActive]}
          onPress={() => setActiveSegment('trainers')}
          activeOpacity={0.7}
        >
          <Ionicons 
            name="barbell" 
            size={16} 
            color={activeSegment === 'trainers' ? COLORS.primary : COLORS.textMuted} 
          />
          <Text style={[styles.topSegmentText, activeSegment === 'trainers' && styles.topSegmentTextActive]}>
            Trainers ({trainers.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.topSegmentBtn, activeSegment === 'hiring' && styles.topSegmentBtnActive]}
          onPress={() => setActiveSegment('hiring')}
          activeOpacity={0.7}
        >
          <Ionicons 
            name="briefcase" 
            size={16} 
            color={activeSegment === 'hiring' ? COLORS.primary : COLORS.textMuted} 
          />
          <Text style={[styles.topSegmentText, activeSegment === 'hiring' && styles.topSegmentTextActive]}>
            Trainer Hiring ({jobs.length} Open)
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollArea} 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
      >
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={styles.loadingText}>Fetching database trainer records…</Text>
          </View>
        ) : activeSegment === 'trainers' ? (
          <>
            {/* SUB-TABS: Trainers List | Trainer Fees | Trainer Payments | Payment History */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.subTabsScroll} contentContainerStyle={styles.subTabsContainer}>
              {[
                { key: 'list', label: 'Trainers List', icon: 'barbell' },
                { key: 'fees', label: 'Trainer Fees', icon: 'cash-outline' },
                { key: 'payments', label: 'Trainer Payments', icon: 'card-outline' },
                { key: 'history', label: 'Payment History', icon: 'time-outline' },
              ].map((tab) => {
                const isActive = trainerSubTab === tab.key;
                return (
                  <TouchableOpacity
                    key={tab.key}
                    style={[styles.subTabPill, isActive && styles.subTabPillActive]}
                    onPress={() => setTrainerSubTab(tab.key as any)}
                    activeOpacity={0.7}
                  >
                    <Ionicons 
                      name={tab.icon as any} 
                      size={14} 
                      color={isActive ? COLORS.white : COLORS.textMuted} 
                    />
                    <Text style={[styles.subTabPillText, isActive && styles.subTabPillTextActive]}>
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* WEB-MATCHING PAGE HEADER */}
            <View style={styles.pageHeaderRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.pageHeaderTitle}>
                  {trainerSubTab === 'list' ? 'Trainers' :
                   trainerSubTab === 'fees' ? 'Trainer Fees' :
                   trainerSubTab === 'payments' ? 'Trainer Payments' : 'Payment History'}
                </Text>
                <Text style={styles.pageHeaderSub}>
                  {trainerSubTab === 'list' ? 'Manage all trainers hired by your gym.' :
                   trainerSubTab === 'fees' ? 'Configure trainer billing cycles, commission and fees.' :
                   trainerSubTab === 'payments' ? 'Track pending trainer payouts and session wages.' : 'Complete transaction ledger of trainer settlements.'}
                </Text>
              </View>
              {trainerSubTab === 'list' && (
                <TouchableOpacity 
                  style={styles.hireBtn}
                  onPress={() => setShowHireModal(true)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="add" size={16} color={COLORS.white} />
                  <Text style={styles.hireBtnText}>Hire Trainer</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* SUB-TAB 1: TRAINERS LIST */}
            {trainerSubTab === 'list' && (
              <>
                {/* Search Bar */}
                <View style={styles.searchBar}>
                  <Ionicons name="search-outline" size={16} color={COLORS.textMuted} />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search by name, email or phone..."
                    placeholderTextColor={COLORS.textMuted}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
                  {searchQuery ? (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                      <Ionicons name="close-circle" size={16} color={COLORS.textMuted} />
                    </TouchableOpacity>
                  ) : null}
                </View>

                {/* Filter Pills */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
                  {(['All', 'Active', 'Suspended', 'Pending', 'Rejected'] as const).map((st) => {
                    const isSelected = statusFilter === st;
                    return (
                      <TouchableOpacity
                        key={st}
                        style={[styles.filterChip, isSelected && styles.filterChipActive]}
                        onPress={() => setStatusFilter(st)}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.filterChipText, isSelected && styles.filterChipTextActive]}>
                          {st}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                {/* Trainer Cards List */}
                <View style={styles.trainersList}>
                  {filteredTrainers.length === 0 ? (
                    <View style={styles.emptyCardBox}>
                      <Ionicons name="barbell-outline" size={36} color={COLORS.textMuted} />
                      <Text style={styles.emptyCardTitle}>No Trainers Found</Text>
                      <Text style={styles.emptyCardText}>
                        {searchQuery || statusFilter !== 'All' 
                          ? 'No trainers match your selected filters. Try resetting search.' 
                          : 'No trainers enrolled in database staff roster yet. Click "+ Hire Trainer" to add.'}
                      </Text>
                    </View>
                  ) : (
                    filteredTrainers.map((t) => {
                      const isSuspended = t.status === 'Suspended';
                      const isActive = t.status === 'Active';
                      const isPending = t.status === 'Pending';
                      const isRejected = t.status === 'Rejected';

                      return (
                        <View key={t._id} style={styles.trainerCard}>
                          {/* Card Top Row: Info & Status Badge */}
                          <View style={styles.cardHeader}>
                            <View style={styles.avatar}>
                              <Text style={styles.avatarText}>{t.name?.charAt(0)?.toUpperCase() || 'T'}</Text>
                            </View>
                            <View style={styles.cardHeaderInfo}>
                              <Text style={styles.trainerNameText}>{t.name}</Text>
                              <Text style={styles.trainerEmailText}>{t.email}</Text>
                              {t.phone ? (
                                <Text style={styles.trainerPhoneText}>{t.phone}</Text>
                              ) : null}
                            </View>
                            <View style={[
                              styles.statusBadge,
                              isActive && styles.statusBadgeActive,
                              isSuspended && styles.statusBadgeSuspended,
                              isPending && styles.statusBadgePending,
                              isRejected && styles.statusBadgeRejected
                            ]}>
                              <Text style={[
                                styles.statusBadgeText,
                                isActive && styles.statusBadgeTextActive,
                                isSuspended && styles.statusBadgeTextSuspended,
                                isPending && styles.statusBadgeTextPending,
                                isRejected && styles.statusBadgeTextRejected
                              ]}>
                                {t.status}
                              </Text>
                            </View>
                          </View>

                          {/* Card Middle: Specialization, Mode, Fee */}
                          <View style={styles.cardDetailsBox}>
                            <View style={styles.detailItem}>
                              <Text style={styles.detailLabel}>SPECIALIZATION</Text>
                              <Text style={styles.detailValue}>{t.specialization || 'General'}</Text>
                            </View>

                            <View style={styles.detailItem}>
                              <Text style={styles.detailLabel}>MODE</Text>
                              <View style={styles.modePill}>
                                <Text style={styles.modePillText}>
                                  {t.trainingMode ? t.trainingMode.charAt(0).toUpperCase() + t.trainingMode.slice(1) : 'Both'}
                                </Text>
                              </View>
                            </View>

                            <View style={styles.detailItem}>
                              <Text style={styles.detailLabel}>FEE</Text>
                              {t.fee && Number(t.fee) > 0 ? (
                                <Text style={styles.feeValue}>
                                  ₹{Number(t.fee).toLocaleString('en-IN')}
                                  <Text style={styles.feeCycle}> / {t.paymentType === 'Per Session' ? 'ses' : t.paymentType === 'Per Week' ? 'wk' : 'mo'}</Text>
                                </Text>
                              ) : t.expectedSalary ? (
                                <Text style={styles.feeValue}>
                                  ₹{Number(t.expectedSalary).toLocaleString('en-IN')}
                                  <Text style={styles.feeCycle}> exp</Text>
                                </Text>
                              ) : (
                                <Text style={styles.feeNotConfigured}>Not configured</Text>
                              )}
                            </View>
                          </View>

                          {/* Card Bottom: Action Toolbar (View, Edit, Status Toggles, Delete, Call) */}
                          <View style={styles.cardActionsRow}>
                            {/* Left View & Edit Buttons */}
                            <TouchableOpacity 
                              style={styles.actionIconBtn} 
                              onPress={() => openViewModal(t)}
                              accessibilityLabel="View Profile"
                            >
                              <Ionicons name="eye-outline" size={17} color={COLORS.textMedium} />
                            </TouchableOpacity>

                            <TouchableOpacity 
                              style={styles.actionIconBtn} 
                              onPress={() => openEditModal(t)}
                              accessibilityLabel="Edit Trainer"
                            >
                              <Ionicons name="pencil-outline" size={17} color={COLORS.textMedium} />
                            </TouchableOpacity>

                            {/* Center Status Controls Divider */}
                            <View style={styles.statusIconsCluster}>
                              <TouchableOpacity 
                                style={[styles.statusIconBtn, isActive && styles.statusIconBtnCurrent]}
                                onPress={() => handleSetStatus(t._id, t.name, 'Active')}
                                accessibilityLabel="Set Active"
                              >
                                <Ionicons name="checkmark-circle-outline" size={18} color={isActive ? COLORS.primary : COLORS.textMuted} />
                              </TouchableOpacity>

                              <TouchableOpacity 
                                style={[styles.statusIconBtn, isSuspended && styles.statusIconBtnCurrent]}
                                onPress={() => handleSetStatus(t._id, t.name, 'Suspended')}
                                accessibilityLabel="Set Suspended"
                              >
                                <Ionicons name="pause-circle-outline" size={18} color={isSuspended ? '#DC2626' : COLORS.textMuted} />
                              </TouchableOpacity>

                              <TouchableOpacity 
                                style={[styles.statusIconBtn, isPending && styles.statusIconBtnCurrent]}
                                onPress={() => handleSetStatus(t._id, t.name, 'Pending')}
                                accessibilityLabel="Set Pending"
                              >
                                <Ionicons name="time-outline" size={18} color={isPending ? '#D97706' : COLORS.textMuted} />
                              </TouchableOpacity>

                              <TouchableOpacity 
                                style={[styles.statusIconBtn, isRejected && styles.statusIconBtnCurrent]}
                                onPress={() => handleSetStatus(t._id, t.name, 'Rejected')}
                                accessibilityLabel="Set Rejected"
                              >
                                <Ionicons name="ban-outline" size={18} color={isRejected ? '#DC2626' : COLORS.textMuted} />
                              </TouchableOpacity>
                            </View>

                            {/* Right Delete & Call */}
                            <TouchableOpacity 
                              style={styles.actionIconBtn} 
                              onPress={() => handleDeleteTrainer(t._id, t.name)}
                              accessibilityLabel="Delete Trainer"
                            >
                              <Ionicons name="trash-outline" size={17} color="#DC2626" />
                            </TouchableOpacity>

                            {t.phone ? (
                              <TouchableOpacity 
                                style={styles.actionCallBtn}
                                onPress={() => handleCallTrainer(t.phone)}
                              >
                                <Ionicons name="call" size={13} color={COLORS.primary} />
                                <Text style={styles.actionCallText}>Call</Text>
                              </TouchableOpacity>
                            ) : null}
                          </View>
                        </View>
                      );
                    })
                  )}
                </View>
              </>
            )}

            {/* SUB-TAB 2: TRAINER FEES */}
            {trainerSubTab === 'fees' && (
              <View style={styles.trainersList}>
                {trainers.map((t) => (
                  <View key={t._id} style={styles.trainerCard}>
                    <View style={styles.cardHeader}>
                      <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{t.name?.charAt(0) || 'T'}</Text>
                      </View>
                      <View style={styles.cardHeaderInfo}>
                        <Text style={styles.trainerNameText}>{t.name}</Text>
                        <Text style={styles.trainerEmailText}>{t.specialization || 'Coaching Staff'}</Text>
                      </View>
                      <TouchableOpacity 
                        style={styles.configFeeBtn}
                        onPress={() => openFeeModal(t)}
                      >
                        <Ionicons name="create-outline" size={14} color={COLORS.primary} />
                        <Text style={styles.configFeeBtnText}>Set Fee</Text>
                      </TouchableOpacity>
                    </View>

                    <View style={styles.cardDetailsBox}>
                      <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>CURRENT FEE</Text>
                        <Text style={styles.feeValue}>
                          {t.fee ? `₹${Number(t.fee).toLocaleString('en-IN')}` : 'Not set'}
                        </Text>
                      </View>
                      <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>BILLING CYCLE</Text>
                        <Text style={styles.detailValue}>{t.paymentType || 'Per Month'}</Text>
                      </View>
                      <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>MODE</Text>
                        <Text style={styles.detailValue}>{t.trainingMode || 'both'}</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* SUB-TAB 3: TRAINER PAYMENTS */}
            {trainerSubTab === 'payments' && (
              <View style={styles.trainersList}>
                {trainers.map((t) => (
                  <View key={t._id} style={styles.trainerCard}>
                    <View style={styles.cardHeader}>
                      <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{t.name?.charAt(0) || 'T'}</Text>
                      </View>
                      <View style={styles.cardHeaderInfo}>
                        <Text style={styles.trainerNameText}>{t.name}</Text>
                        <Text style={styles.trainerEmailText}>{t.phone || t.email}</Text>
                      </View>
                      <View style={[styles.statusBadge, styles.statusBadgeActive]}>
                        <Text style={[styles.statusBadgeText, styles.statusBadgeTextActive]}>Active Contract</Text>
                      </View>
                    </View>

                    <View style={styles.cardDetailsBox}>
                      <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>MONTHLY BASE</Text>
                        <Text style={styles.feeValue}>{t.fee ? `₹${Number(t.fee).toLocaleString('en-IN')}` : '₹0'}</Text>
                      </View>
                      <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>CYCLE</Text>
                        <Text style={styles.detailValue}>{t.paymentType || 'Monthly'}</Text>
                      </View>
                      <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>PAYMENT STATUS</Text>
                        <Text style={[styles.detailValue, { color: '#15803D' }]}>Settled</Text>
                      </View>
                    </View>

                    <TouchableOpacity 
                      style={styles.payNowBtn}
                      onPress={() => Alert.alert('Process Payout', `Initiating payment cycle settlement for ${t.name}.`)}
                    >
                      <Ionicons name="card" size={14} color={COLORS.white} />
                      <Text style={styles.payNowBtnText}>Process Settlement</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {/* SUB-TAB 4: PAYMENT HISTORY */}
            {trainerSubTab === 'history' && (
              <View style={styles.trainersList}>
                <View style={styles.emptyCardBox}>
                  <Ionicons name="document-text-outline" size={36} color={COLORS.textMuted} />
                  <Text style={styles.emptyCardTitle}>Payout History Ledger</Text>
                  <Text style={styles.emptyCardText}>All recorded monthly and per-session trainer disbursements will appear here.</Text>
                </View>
              </View>
            )}
          </>
        ) : (
          /* =======================================================
             TRAINER HIRING SECTION (MATCHING WEB ADMIN HIRING)
             ======================================================= */
          <>
            {/* SUB-TABS: Post a Job | Manage Jobs | Job Applications | Hired Trainers */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.subTabsScroll} contentContainerStyle={styles.subTabsContainer}>
              {[
                { key: 'jobs', label: `Manage Jobs (${jobs.length})`, icon: 'briefcase' },
                { key: 'post', label: '+ Post a Job', icon: 'add-circle' },
                { key: 'applications', label: `Applications (${applications.length})`, icon: 'people' },
                { key: 'hired', label: `Hired (${hiredTrainers.length})`, icon: 'ribbon' },
              ].map((tab) => {
                const isActive = hiringSubTab === tab.key;
                return (
                  <TouchableOpacity
                    key={tab.key}
                    style={[styles.subTabPill, isActive && styles.subTabPillActive]}
                    onPress={() => setHiringSubTab(tab.key as any)}
                    activeOpacity={0.7}
                  >
                    <Ionicons 
                      name={tab.icon as any} 
                      size={14} 
                      color={isActive ? COLORS.white : COLORS.textMuted} 
                    />
                    <Text style={[styles.subTabPillText, isActive && styles.subTabPillTextActive]}>
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* WEB-MATCHING PAGE HEADER */}
            <View style={styles.pageHeaderRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.pageHeaderTitle}>Trainer Hiring & Vacancies</Text>
                <Text style={styles.pageHeaderSub}>
                  Create coaching vacancies, review trainer applications, and manage interview schedules.
                </Text>
              </View>
            </View>

            {/* WEB-MATCHING KPI OVERVIEW CARDS (2x2) */}
            <View style={styles.kpiGrid}>
              <View style={styles.kpiCard}>
                <View style={[styles.kpiIconBox, { backgroundColor: '#FFF7ED', borderColor: '#FFEDD5' }]}>
                  <Ionicons name="briefcase-outline" size={18} color={COLORS.primary} />
                </View>
                <View>
                  <Text style={styles.kpiLabel}>TOTAL VACANCIES</Text>
                  <Text style={styles.kpiValue}>{jobs.length}</Text>
                </View>
              </View>

              <View style={styles.kpiCard}>
                <View style={[styles.kpiIconBox, { backgroundColor: '#DCFCE7', borderColor: '#BBF7D0' }]}>
                  <Ionicons name="checkmark-circle-outline" size={18} color="#15803D" />
                </View>
                <View>
                  <Text style={styles.kpiLabel}>ACTIVE PUBLISHED</Text>
                  <Text style={styles.kpiValue}>{jobs.filter(j => j.status === 'Published').length}</Text>
                </View>
              </View>

              <View style={styles.kpiCard}>
                <View style={[styles.kpiIconBox, { backgroundColor: '#F0FDFA', borderColor: '#CCFBF1' }]}>
                  <Ionicons name="people-outline" size={18} color="#0D9488" />
                </View>
                <View>
                  <Text style={styles.kpiLabel}>TOTAL APPLICANTS</Text>
                  <Text style={styles.kpiValue}>{applications.length}</Text>
                </View>
              </View>

              <View style={styles.kpiCard}>
                <View style={[styles.kpiIconBox, { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' }]}>
                  <Ionicons name="ribbon-outline" size={18} color="#B45309" />
                </View>
                <View>
                  <Text style={styles.kpiLabel}>TRAINERS HIRED</Text>
                  <Text style={styles.kpiValue}>{hiredTrainers.length}</Text>
                </View>
              </View>
            </View>

            {/* SUB-VIEW 1: MANAGE JOBS (MATCHING WEB IMAGE 3) */}
            {hiringSubTab === 'jobs' && (
              <>
                {/* Search & Filters */}
                <View style={styles.searchBar}>
                  <Ionicons name="search-outline" size={16} color={COLORS.textMuted} />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search by vacancy title, expertise, or location..."
                    placeholderTextColor={COLORS.textMuted}
                    value={jobSearchQuery}
                    onChangeText={setJobSearchQuery}
                  />
                  <TouchableOpacity style={styles.searchSubmitBtn}>
                    <Text style={styles.searchSubmitBtnText}>Search</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
                  {(['All Status', 'Published', 'Draft', 'Closed'] as const).map((st) => {
                    const filterKey = st === 'All Status' ? 'All' : st;
                    const isActive = jobStatusFilter === filterKey;
                    return (
                      <TouchableOpacity
                        key={st}
                        style={[styles.filterChip, isActive && styles.filterChipActive]}
                        onPress={() => setJobStatusFilter(filterKey as any)}
                      >
                        <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                          {st}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                <View style={styles.trainersList}>
                  {filteredJobs.length === 0 ? (
                    <View style={styles.emptyCardBox}>
                      <Ionicons name="briefcase-outline" size={36} color={COLORS.textMuted} />
                      <Text style={styles.emptyCardTitle}>No Vacancies Found</Text>
                      <Text style={styles.emptyCardText}>
                        {jobSearchQuery || jobStatusFilter !== 'All'
                          ? 'No vacancies match your search filter.'
                          : 'You have not posted any trainer vacancies yet. Click "+ Post a Job" to attract certified coaches.'}
                      </Text>
                    </View>
                  ) : (
                    filteredJobs.map((job) => {
                      const isClosed = job.status === 'Closed' || (job.deadline && new Date(job.deadline) < new Date());
                      const isPublished = job.status === 'Published' && !isClosed;
                      const isDraft = job.status === 'Draft';
                      const salaryDisplay = job.salaryMin && job.salaryMax
                        ? `₹${Number(job.salaryMin).toLocaleString('en-IN')} - ₹${Number(job.salaryMax).toLocaleString('en-IN')} / ${job.salaryType || 'Monthly'}`
                        : (job.salary || '₹20,000 - ₹40,000 / Monthly');
                      const expDisplay = job.experience ? `Experience: ${job.experience}` : 'Experience: 1-2 Years';
                      const deadlineDisplay = job.deadline 
                        ? `Deadline: ${new Date(job.deadline).toLocaleDateString('en-US')}${isClosed ? ' (Job Vacancy Over)' : ''}`
                        : 'Deadline: Ongoing';

                      return (
                        <View key={job._id || job.id} style={styles.jobCard}>
                          {/* Top Tag Row (Matching Web Image 3) */}
                          <View style={styles.jobTopTagsRow}>
                            <View style={[
                              styles.jobVacancyStatusPill,
                              isClosed ? styles.jobVacancyOverPill : isPublished ? styles.jobVacancyPublishedPill : styles.jobVacancyDraftPill
                            ]}>
                              <View style={[
                                styles.jobVacancyDot,
                                { backgroundColor: isClosed ? '#EF4444' : isPublished ? '#10B981' : '#F59E0B' }
                              ]} />
                              <Text style={[
                                styles.jobVacancyStatusText,
                                isClosed ? styles.jobVacancyOverText : isPublished ? styles.jobVacancyPublishedText : styles.jobVacancyDraftText
                              ]}>
                                {isClosed ? 'Job Vacancy Over' : isPublished ? 'Active Published' : 'Draft'}
                              </Text>
                            </View>

                            <View style={styles.jobEmploymentPill}>
                              <Ionicons name="time-outline" size={12} color="#64748B" />
                              <Text style={styles.jobEmploymentText}>{job.employmentType || 'Part-time'}</Text>
                            </View>

                            <View style={styles.jobLocationPill}>
                              <Ionicons name="location-sharp" size={12} color="#EA580C" />
                              <Text style={styles.jobLocationText} numberOfLines={1}>{job.location || 'Main Arena'}</Text>
                            </View>
                          </View>

                          {/* Job Title */}
                          <Text style={styles.webJobTitleText}>{job.title || 'Trainers'}</Text>

                          {/* Salary & Experience Line */}
                          <View style={styles.jobMetaDetailsRow}>
                            <Text style={styles.jobSalaryBoldText}>{salaryDisplay}</Text>
                            <Text style={styles.jobMetaDivider}>•</Text>
                            <Text style={styles.jobMetaSecondaryText}>{expDisplay}</Text>
                            <Text style={styles.jobMetaDivider}>•</Text>
                            <Text style={[styles.jobDeadlineText, isClosed && { color: '#DC2626', fontWeight: '700' }]}>
                              {deadlineDisplay}
                            </Text>
                          </View>

                          {/* Domain Tags */}
                          {job.expertise && job.expertise.length > 0 && (
                            <View style={styles.jobSkillsRow}>
                              {(Array.isArray(job.expertise) ? job.expertise : [job.expertise]).map((sk: string, i: number) => (
                                <View key={i} style={styles.skillTagOrange}>
                                  <Text style={styles.skillTagOrangeText}>{sk}</Text>
                                </View>
                              ))}
                            </View>
                          )}

                          {/* 3 Metric Counters & Action Row (Matching Web Image 3) */}
                          <View style={styles.jobBottomActionCard}>
                            <View style={styles.jobCountersRow}>
                              <TouchableOpacity 
                                style={styles.jobMetricBox}
                                onPress={() => setHiringSubTab('applications')}
                                activeOpacity={0.7}
                              >
                                <Text style={styles.jobMetricVal}>{job.applicantsCount ?? 1}</Text>
                                <Text style={styles.jobMetricLbl}>APPLICANTS</Text>
                              </TouchableOpacity>

                              <View style={styles.jobMetricBox}>
                                <Text style={styles.jobMetricVal}>{job.shortlistedCount ?? 1}</Text>
                                <Text style={styles.jobMetricLbl}>SHORTLISTED</Text>
                              </View>

                              <View style={styles.jobMetricBox}>
                                <Text style={styles.jobMetricVal}>{job.hiredCount ?? 0}</Text>
                                <Text style={styles.jobMetricLbl}>HIRED</Text>
                              </View>
                            </View>

                            <View style={styles.jobCardButtonsRow}>
                              <TouchableOpacity 
                                style={[styles.toggleJobStatusBtn, isClosed && styles.toggleJobStatusBtnReopen]}
                                onPress={() => handleToggleJobStatus(job._id || job.id, isClosed ? 'Draft' : 'Closed')}
                              >
                                <Text style={[styles.toggleJobStatusText, isClosed && styles.toggleJobStatusTextReopen]}>
                                  {isClosed ? 'Reopen Job' : 'Close Job'}
                                </Text>
                              </TouchableOpacity>

                              <TouchableOpacity 
                                style={styles.jobActionIconBtn}
                                onPress={() => {
                                  setPostJobForm({
                                    title: job.title || '',
                                    gymName: user?.gymName || 'Perfect Fitness Studio',
                                    employmentType: job.employmentType || 'Full-time',
                                    trainingMode: (job.trainingMode as any) || 'Offline',
                                    experience: job.experience || '1-2 Years',
                                    vacanciesCount: String(job.vacanciesCount || 1),
                                    salaryMin: String(job.salaryMin || 25000),
                                    salaryMax: String(job.salaryMax || 45000),
                                    salaryType: job.salaryType || 'Monthly',
                                    isSalaryNegotiable: !!job.isSalaryNegotiable,
                                    paymentFrequency: 'Per Month',
                                    location: job.location || 'RK Towers, Rayakottai Rd',
                                    workingHours: job.workingHours || '6:00 AM - 2:00 PM',
                                    deadline: job.deadline ? new Date(job.deadline).toISOString().split('T')[0] : '11/30/2026',
                                    description: job.description || '',
                                    responsibilities: job.responsibilities || '',
                                    expertise: job.expertise || ['Strength & Conditioning']
                                  });
                                  setHiringSubTab('post');
                                }}
                              >
                                <Ionicons name="pencil" size={15} color="#475569" />
                              </TouchableOpacity>

                              <TouchableOpacity 
                                style={[styles.jobActionIconBtn, { backgroundColor: '#FEE2E2' }]} 
                                onPress={() => handleDeleteJob(job._id || job.id, job.title)}
                              >
                                <Ionicons name="trash-outline" size={15} color="#DC2626" />
                              </TouchableOpacity>
                            </View>
                          </View>
                        </View>
                      );
                    })
                  )}
                </View>
              </>
            )}

            {/* SUB-VIEW 2: POST A JOB FORM (MATCHING WEB IMAGES 1 & 2) */}
            {hiringSubTab === 'post' && (
              <View style={styles.postJobWrapper}>
                {/* Back to Manage Vacancies Bar */}
                <View style={styles.postBackHeaderRow}>
                  <TouchableOpacity 
                    style={styles.postBackBtn}
                    onPress={() => setHiringSubTab('jobs')}
                  >
                    <Ionicons name="arrow-back" size={16} color="#0F172A" />
                    <Text style={styles.postBackBtnText}>Back to Manage Vacancies</Text>
                  </TouchableOpacity>
                  <Text style={styles.postGymTagText}>Gym: <Text style={{ fontWeight: '700', color: '#0F172A' }}>{postJobForm.gymName}</Text></Text>
                </View>

                <View style={styles.postJobCard}>
                  {/* Card Title Header with Orange Icon */}
                  <View style={styles.postFormHeaderRow}>
                    <View style={styles.postFormIconBox}>
                      <Ionicons name="briefcase" size={20} color={COLORS.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.postFormTitle}>Post a Trainer Job Vacancy</Text>
                      <Text style={styles.postFormSub}>
                        Fill in the job details, qualifications, and salary expectations to attract certified coaches.
                      </Text>
                    </View>
                  </View>

                  {/* 1. Job Title */}
                  <Text style={styles.inputLabel}>Job Title *</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="e.g. Senior Strength & Conditioning Coach"
                    placeholderTextColor={COLORS.textMuted}
                    value={postJobForm.title}
                    onChangeText={(v) => setPostJobForm({ ...postJobForm, title: v })}
                  />

                  {/* 2. Gym / Facility Name (Read-only verified badge) */}
                  <Text style={styles.inputLabel}>Gym / Facility Name</Text>
                  <View style={styles.verifiedGymBox}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Ionicons name="business" size={16} color={COLORS.primary} />
                      <Text style={styles.verifiedGymNameText}>{postJobForm.gymName}</Text>
                    </View>
                    <View style={styles.verifiedGymBadge}>
                      <Ionicons name="checkmark-circle" size={12} color="#059669" />
                      <Text style={styles.verifiedGymBadgeText}>Verified Gym</Text>
                    </View>
                  </View>

                  {/* 3. Employment Type & Required Experience & Vacancies */}
                  <View style={styles.threeColRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.inputLabel}>Employment Type *</Text>
                      <View style={styles.typeSelectorRow}>
                        {['Full-time', 'Part-time'].map((t) => (
                          <TouchableOpacity
                            key={t}
                            style={[styles.typeChipSmall, postJobForm.employmentType === t && styles.typeChipSmallActive]}
                            onPress={() => setPostJobForm({ ...postJobForm, employmentType: t })}
                          >
                            <Text style={[styles.typeChipSmallText, postJobForm.employmentType === t && styles.typeChipSmallTextActive]}>
                              {t}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={styles.inputLabel}>Required Experience *</Text>
                      <TextInput
                        style={styles.modalInput}
                        placeholder="1-2 Years"
                        placeholderTextColor={COLORS.textMuted}
                        value={postJobForm.experience}
                        onChangeText={(v) => setPostJobForm({ ...postJobForm, experience: v })}
                      />
                    </View>

                    <View style={{ width: 80 }}>
                      <Text style={styles.inputLabel}>Vacancies *</Text>
                      <TextInput
                        style={styles.modalInput}
                        placeholder="1"
                        placeholderTextColor={COLORS.textMuted}
                        value={postJobForm.vacanciesCount}
                        onChangeText={(v) => setPostJobForm({ ...postJobForm, vacanciesCount: v })}
                        keyboardType="numeric"
                      />
                    </View>
                  </View>

                  {/* 4. Coaching Domains & Expertise (All 14 Web Tags) */}
                  <View style={{ marginTop: 8 }}>
                    <Text style={styles.inputLabel}>Coaching Domains & Expertise</Text>
                    <Text style={styles.fieldHintSub}>Select all specializations you are looking for in this trainer.</Text>
                    <View style={styles.skillsTagCloud}>
                      {COMMON_EXPERTISE.map((skill) => {
                        const isSelected = postJobForm.expertise.includes(skill);
                        return (
                          <TouchableOpacity
                            key={skill}
                            style={[styles.skillChipSelect, isSelected && styles.skillChipSelectActive]}
                            onPress={() => toggleExpertise(skill)}
                          >
                            <Text style={[styles.skillChipSelectText, isSelected && styles.skillChipSelectTextActive]}>
                              {isSelected ? '✓ ' : '+ '}{skill}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>

                  {/* 5. Training Mode (3 Big Visual Cards Matching Web Image 2) */}
                  <View style={{ marginTop: 10 }}>
                    <Text style={styles.inputLabel}>Training Mode</Text>
                    <Text style={styles.fieldHintSub}>Select how the trainer will conduct sessions.</Text>
                    <View style={styles.trainingModeCardsRow}>
                      {[
                        { key: 'Online', title: 'Online', desc: 'Remote / virtual sessions only', icon: 'laptop-outline' },
                        { key: 'Offline', title: 'Offline', desc: 'In-person at gym facility', icon: 'barbell-outline' },
                        { key: 'Hybrid', title: 'Hybrid', desc: 'Mix of online & in-person', icon: 'sync-outline' },
                      ].map((item) => {
                        const isSelected = postJobForm.trainingMode === item.key;
                        return (
                          <TouchableOpacity
                            key={item.key}
                            style={[styles.modeBigCard, isSelected && styles.modeBigCardActive]}
                            onPress={() => setPostJobForm({ ...postJobForm, trainingMode: item.key as any })}
                            activeOpacity={0.8}
                          >
                            <View style={styles.modeBigCardHeader}>
                              <Ionicons 
                                name={item.icon as any} 
                                size={18} 
                                color={isSelected ? COLORS.primary : '#64748B'} 
                              />
                              <Text style={[styles.modeBigCardTitle, isSelected && styles.modeBigCardTitleActive]}>
                                {item.title}
                              </Text>
                              {isSelected && (
                                <Ionicons name="checkmark-circle" size={16} color={COLORS.primary} style={{ marginLeft: 'auto' }} />
                              )}
                            </View>
                            <Text style={styles.modeBigCardDesc}>{item.desc}</Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>

                  {/* 6. Salary & Compensation Structure */}
                  <View style={styles.salarySectionBox}>
                    <View style={styles.salarySectionTopRow}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Ionicons name="cash-outline" size={16} color={COLORS.primary} />
                        <Text style={styles.salarySectionTitle}>Salary & Compensation Structure</Text>
                      </View>
                      <TouchableOpacity 
                        style={styles.negotiableCheckRow}
                        onPress={() => setPostJobForm({ ...postJobForm, isSalaryNegotiable: !postJobForm.isSalaryNegotiable })}
                      >
                        <Ionicons 
                          name={postJobForm.isSalaryNegotiable ? 'checkbox' : 'square-outline'} 
                          size={16} 
                          color={postJobForm.isSalaryNegotiable ? COLORS.primary : '#64748B'} 
                        />
                        <Text style={styles.negotiableCheckText}>Negotiable for top candidates</Text>
                      </TouchableOpacity>
                    </View>

                    <View style={styles.threeColRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.inputLabel}>Min Salary (₹)</Text>
                        <TextInput
                          style={styles.modalInput}
                          placeholder="e.g. 25000"
                          placeholderTextColor={COLORS.textMuted}
                          value={postJobForm.salaryMin}
                          onChangeText={(v) => setPostJobForm({ ...postJobForm, salaryMin: v })}
                          keyboardType="numeric"
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.inputLabel}>Max Salary (₹)</Text>
                        <TextInput
                          style={styles.modalInput}
                          placeholder="e.g. 45000"
                          placeholderTextColor={COLORS.textMuted}
                          value={postJobForm.salaryMax}
                          onChangeText={(v) => setPostJobForm({ ...postJobForm, salaryMax: v })}
                          keyboardType="numeric"
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.inputLabel}>Payment Frequency</Text>
                        <TextInput
                          style={styles.modalInput}
                          placeholder="Per Month"
                          placeholderTextColor={COLORS.textMuted}
                          value={postJobForm.paymentFrequency}
                          onChangeText={(v) => setPostJobForm({ ...postJobForm, paymentFrequency: v })}
                        />
                      </View>
                    </View>
                  </View>

                  {/* 7. Location, Working Hours & Application Deadline */}
                  <Text style={styles.inputLabel}>Location *</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="RK Towers, Rayakottai Rd, opposite to HF"
                    placeholderTextColor={COLORS.textMuted}
                    value={postJobForm.location}
                    onChangeText={(v) => setPostJobForm({ ...postJobForm, location: v })}
                  />

                  <View style={styles.twoColRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.inputLabel}>Working Hours / Shift</Text>
                      <TextInput
                        style={styles.modalInput}
                        placeholder="e.g. 6:00 AM - 2:00 PM or Flexible"
                        placeholderTextColor={COLORS.textMuted}
                        value={postJobForm.workingHours}
                        onChangeText={(v) => setPostJobForm({ ...postJobForm, workingHours: v })}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.inputLabel}>Application Deadline</Text>
                      <TextInput
                        style={styles.modalInput}
                        placeholder="mm/dd/yyyy"
                        placeholderTextColor={COLORS.textMuted}
                        value={postJobForm.deadline}
                        onChangeText={(v) => setPostJobForm({ ...postJobForm, deadline: v })}
                      />
                    </View>
                  </View>
                  <Text style={styles.deadlineHintText}>
                    Once this deadline is completed, the job vacancy will automatically be shown as over.
                  </Text>

                  {/* 8. Job Description */}
                  <Text style={styles.inputLabel}>Job Description *</Text>
                  <TextInput
                    style={[styles.modalInput, { height: 90, textAlignVertical: 'top' }]}
                    placeholder="Provide a compelling overview of this role, the gym environment, and what makes your fitness community unique..."
                    placeholderTextColor={COLORS.textMuted}
                    value={postJobForm.description}
                    onChangeText={(v) => setPostJobForm({ ...postJobForm, description: v })}
                    multiline
                  />

                  {/* 9. Publish & Draft Action Buttons */}
                  <View style={styles.formActionButtonsRow}>
                    <TouchableOpacity 
                      style={styles.saveDraftBtn}
                      onPress={() => handlePublishJob('Draft')}
                      disabled={publishingJob}
                    >
                      <Text style={styles.saveDraftBtnText}>Save Draft</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={styles.publishBtn}
                      onPress={() => handlePublishJob('Published')}
                      disabled={publishingJob}
                    >
                      {publishingJob ? (
                        <ActivityIndicator size="small" color={COLORS.white} />
                      ) : (
                        <>
                          <Ionicons name="send" size={15} color={COLORS.white} />
                          <Text style={styles.publishBtnText}>Publish Job</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}

            {/* SUB-VIEW 3: JOB APPLICATIONS (MATCHING WEB IMAGE 4) */}
            {hiringSubTab === 'applications' && (
              <View style={styles.trainersList}>
                {/* Header Block matching Web Image 4 */}
                <View style={styles.applicationsHeaderCard}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <View style={styles.postFormIconBox}>
                      <Ionicons name="people" size={20} color={COLORS.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.pageHeaderTitle}>Trainer Applications</Text>
                      <Text style={styles.pageHeaderSub}>
                        Review candidate resumes, shortlist elite fitness experts, schedule interviews and extend offers
                      </Text>
                    </View>
                  </View>
                </View>

                {applications.length === 0 ? (
                  <View style={styles.emptyCardBox}>
                    <Ionicons name="people-outline" size={36} color={COLORS.textMuted} />
                    <Text style={styles.emptyCardTitle}>No Candidates Yet</Text>
                    <Text style={styles.emptyCardText}>Incoming trainer job applications will be catalogued here for review.</Text>
                  </View>
                ) : (
                  applications.map((app) => {
                    const isShortlisted = app.status === 'Shortlisted';
                    const isHired = app.status === 'Hired' || app.status === 'Selected';
                    const isRejected = app.status === 'Rejected';

                    return (
                      <View key={app._id || app.id} style={styles.applicationCardWeb}>
                        {/* Candidate Row (Matching Web Image 4: selva kumar) */}
                        <View style={styles.appWebTopRow}>
                          <View style={{ flex: 1 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                              <Text style={styles.appCandidateName}>{app.fullName || app.name || 'selva kumar'}</Text>
                              <TouchableOpacity 
                                onPress={() => {
                                  setSelectedApplication(app);
                                  setShowAppModal(true);
                                }}
                              >
                                <Ionicons name="document-text-outline" size={16} color="#EA580C" />
                              </TouchableOpacity>
                            </View>
                            <View style={styles.appContactLine}>
                              <Ionicons name="mail-outline" size={12} color="#64748B" />
                              <Text style={styles.appEmailText}>{app.email}</Text>
                              {app.phone ? (
                                <>
                                  <Text style={{ color: '#CBD5E1' }}>|</Text>
                                  <Ionicons name="call-outline" size={12} color="#64748B" />
                                  <Text style={styles.appPhoneText}>{app.phone}</Text>
                                </>
                              ) : null}
                            </View>
                          </View>

                          {/* Status Pill (e.g. Shortlisted purple pill) */}
                          <View style={[
                            styles.appWebStatusPill,
                            isShortlisted ? styles.appStatusShortlistedPill : isHired ? styles.appStatusHiredPill : isRejected ? styles.appStatusRejectedPill : styles.appStatusAppliedPill
                          ]}>
                            <View style={[
                              styles.appStatusDot,
                              { backgroundColor: isShortlisted ? '#9333EA' : isHired ? '#10B981' : isRejected ? '#EF4444' : '#F59E0B' }
                            ]} />
                            <Text style={[
                              styles.appWebStatusText,
                              isShortlisted ? styles.appStatusShortlistedText : isHired ? styles.appStatusHiredText : isRejected ? styles.appStatusRejectedText : styles.appStatusAppliedText
                            ]}>
                              {app.status || 'Shortlisted'}
                            </Text>
                          </View>
                        </View>

                        {/* Applied Vacancy & Experience Grid */}
                        <View style={styles.appWebGrid}>
                          <View style={styles.appWebGridCol}>
                            <Text style={styles.appGridLabel}>APPLIED VACANCY</Text>
                            <Text style={styles.appGridValBold}>{app.jobId?.title || app.role || 'Trainers'}</Text>
                            <Text style={styles.appGridValSub}>
                              {app.jobId?.employmentType || 'Part-time'} • {app.jobId?.location || 'Tirupattur busstand near'}
                            </Text>
                          </View>

                          <View style={styles.appWebGridCol}>
                            <Text style={styles.appGridLabel}>EXPERIENCE & EXPERTISE</Text>
                            <Text style={styles.appGridValBold}>
                              {app.yearsOfExperience || app.workExperience || '3 Years'}
                            </Text>
                            <View style={styles.appExpertiseBadge}>
                              <Text style={styles.appExpertiseBadgeText}>
                                {Array.isArray(app.expertise) ? app.expertise[0] : (app.expertise || 'Nutrition Coaching')}
                              </Text>
                            </View>
                          </View>

                          <View style={styles.appWebGridCol}>
                            <Text style={styles.appGridLabel}>EXPECTED SALARY</Text>
                            <Text style={styles.appGridValBold}>
                              {app.expectedSalary ? (app.expectedSalary.startsWith('₹') ? app.expectedSalary : `₹${app.expectedSalary}`) : 'sdcsds'}
                            </Text>
                          </View>
                        </View>

                        {/* Action Buttons Row */}
                        <View style={styles.appWebActionRow}>
                          <TouchableOpacity 
                            style={styles.appReviewBtn}
                            onPress={() => {
                              setSelectedApplication(app);
                              setShowAppModal(true);
                            }}
                          >
                            <Ionicons name="eye-outline" size={14} color="#0F172A" />
                            <Text style={styles.appReviewBtnText}>Review Resume</Text>
                          </TouchableOpacity>

                          <TouchableOpacity 
                            style={styles.appShortlistBtn}
                            onPress={() => handleUpdateAppStatus(app._id || app.id, app.fullName || app.name, 'Shortlisted')}
                          >
                            <Text style={styles.appShortlistBtnText}>Shortlist</Text>
                          </TouchableOpacity>

                          <TouchableOpacity 
                            style={styles.appHireBtn}
                            onPress={() => handleUpdateAppStatus(app._id || app.id, app.fullName || app.name, 'Hired')}
                          >
                            <Text style={styles.appHireBtnText}>Hire</Text>
                          </TouchableOpacity>

                          {app.phone ? (
                            <TouchableOpacity 
                              style={styles.appCallBtn}
                              onPress={() => handleCallTrainer(app.phone)}
                            >
                              <Ionicons name="call" size={14} color="#EA580C" />
                            </TouchableOpacity>
                          ) : null}
                        </View>
                      </View>
                    );
                  })
                )}
              </View>
            )}

            {/* SUB-VIEW 4: HIRED TRAINERS */}
            {hiringSubTab === 'hired' && (
              <View style={styles.trainersList}>
                {hiredTrainers.length === 0 ? (
                  <View style={styles.emptyCardBox}>
                    <Ionicons name="ribbon-outline" size={36} color={COLORS.textMuted} />
                    <Text style={styles.emptyCardTitle}>No Recruited Coaches</Text>
                    <Text style={styles.emptyCardText}>Trainers recruited from job postings appear here.</Text>
                  </View>
                ) : (
                  hiredTrainers.map((h) => (
                    <View key={h._id || h.id} style={styles.trainerCard}>
                      <View style={styles.cardHeader}>
                        <View style={styles.avatar}>
                          <Text style={styles.avatarText}>{(h.trainerName || h.name || 'H').charAt(0)}</Text>
                        </View>
                        <View style={styles.cardHeaderInfo}>
                          <Text style={styles.trainerNameText}>{h.trainerName || h.name}</Text>
                          <Text style={styles.trainerEmailText}>{h.role || 'Certified Trainer'}</Text>
                        </View>
                        <View style={[styles.statusBadge, styles.statusBadgeActive]}>
                          <Text style={[styles.statusBadgeText, styles.statusBadgeTextActive]}>Hired</Text>
                        </View>
                      </View>
                      <View style={styles.cardDetailsBox}>
                        <View style={styles.detailItem}>
                          <Text style={styles.detailLabel}>CONTRACT</Text>
                          <Text style={styles.detailValue}>{h.contractDuration || '1 Year Active'}</Text>
                        </View>
                        <View style={styles.detailItem}>
                          <Text style={styles.detailLabel}>LOCATION</Text>
                          <Text style={styles.detailValue}>{h.branchName || user?.branchName || 'Main Arena'}</Text>
                        </View>
                      </View>
                    </View>
                  ))
                )}
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* =======================================================
          MODAL 1: HIRE TRAINER MODAL (MANUAL ADD / SEND INVITE)
          ======================================================= */}
      <Modal visible={showHireModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Hire New Trainer</Text>
              <TouchableOpacity onPress={() => setShowHireModal(false)}>
                <Ionicons name="close" size={22} color={COLORS.textMedium} />
              </TouchableOpacity>
            </View>

            {/* Method Toggle: Manual Add vs Invite by Email */}
            <View style={styles.methodToggleRow}>
              <TouchableOpacity
                style={[styles.methodToggleBtn, hireMethod === 'manual' && styles.methodToggleBtnActive]}
                onPress={() => setHireMethod('manual')}
              >
                <Text style={[styles.methodToggleText, hireMethod === 'manual' && styles.methodToggleTextActive]}>
                  Add Manually
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.methodToggleBtn, hireMethod === 'invite' && styles.methodToggleBtnActive]}
                onPress={() => setHireMethod('invite')}
              >
                <Text style={[styles.methodToggleText, hireMethod === 'invite' && styles.methodToggleTextActive]}>
                  Invite by Email
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator={false}>
              {hireMethod === 'manual' ? (
                <>
                  <Text style={styles.inputLabel}>Full Name *</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="e.g. Naveen Kumar"
                    placeholderTextColor={COLORS.textMuted}
                    value={manualForm.name}
                    onChangeText={(v) => setManualForm({ ...manualForm, name: v })}
                  />

                  <Text style={styles.inputLabel}>Email Address *</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="e.g. trainer@gymora.com"
                    placeholderTextColor={COLORS.textMuted}
                    value={manualForm.email}
                    onChangeText={(v) => setManualForm({ ...manualForm, email: v })}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />

                  <Text style={styles.inputLabel}>Mobile Phone * (10 Digits)</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="e.g. 9876543210"
                    placeholderTextColor={COLORS.textMuted}
                    value={manualForm.phone}
                    onChangeText={(v) => setManualForm({ ...manualForm, phone: v })}
                    keyboardType="phone-pad"
                  />

                  <Text style={styles.inputLabel}>Specialization</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="e.g. Nutrition Coaching / Strength"
                    placeholderTextColor={COLORS.textMuted}
                    value={manualForm.specialization}
                    onChangeText={(v) => setManualForm({ ...manualForm, specialization: v })}
                  />

                  <Text style={styles.inputLabel}>Training Mode</Text>
                  <View style={styles.typeSelectorRow}>
                    {['offline', 'online', 'both'].map((m) => (
                      <TouchableOpacity
                        key={m}
                        style={[styles.typeChip, manualForm.trainingMode === m && styles.typeChipActive]}
                        onPress={() => setManualForm({ ...manualForm, trainingMode: m })}
                      >
                        <Text style={[styles.typeChipText, manualForm.trainingMode === m && styles.typeChipTextActive]}>
                          {m.charAt(0).toUpperCase() + m.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <View style={styles.twoColRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.inputLabel}>Monthly Fee (₹)</Text>
                      <TextInput
                        style={styles.modalInput}
                        placeholder="e.g. 25000"
                        placeholderTextColor={COLORS.textMuted}
                        value={manualForm.fee}
                        onChangeText={(v) => setManualForm({ ...manualForm, fee: v })}
                        keyboardType="numeric"
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.inputLabel}>Billing Cycle</Text>
                      <TextInput
                        style={styles.modalInput}
                        placeholder="Per Month"
                        placeholderTextColor={COLORS.textMuted}
                        value={manualForm.paymentType}
                        onChangeText={(v) => setManualForm({ ...manualForm, paymentType: v })}
                      />
                    </View>
                  </View>

                  <Text style={styles.inputLabel}>Account Password *</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="Set temporary password"
                    placeholderTextColor={COLORS.textMuted}
                    value={manualForm.password}
                    onChangeText={(v) => setManualForm({ ...manualForm, password: v })}
                    secureTextEntry
                  />
                </>
              ) : (
                <>
                  <Text style={styles.inputLabel}>Trainer Name *</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="e.g. Suresh Raina"
                    placeholderTextColor={COLORS.textMuted}
                    value={inviteForm.trainerName}
                    onChangeText={(v) => setInviteForm({ ...inviteForm, trainerName: v })}
                  />

                  <Text style={styles.inputLabel}>Trainer Email Address *</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="e.g. suresh@fitness.com"
                    placeholderTextColor={COLORS.textMuted}
                    value={inviteForm.email}
                    onChangeText={(v) => setInviteForm({ ...inviteForm, email: v })}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />

                  <Text style={styles.inputLabel}>Mobile Phone (Optional)</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="e.g. 9876543210"
                    placeholderTextColor={COLORS.textMuted}
                    value={inviteForm.phone}
                    onChangeText={(v) => setInviteForm({ ...inviteForm, phone: v })}
                    keyboardType="phone-pad"
                  />

                  <Text style={styles.inputLabel}>Personal Invitation Message</Text>
                  <TextInput
                    style={[styles.modalInput, { height: 75, textAlignVertical: 'top' }]}
                    placeholder="Add personal note to invitation email..."
                    placeholderTextColor={COLORS.textMuted}
                    value={inviteForm.personalMessage}
                    onChangeText={(v) => setInviteForm({ ...inviteForm, personalMessage: v })}
                    multiline
                  />
                </>
              )}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.modalCancelBtn} 
                onPress={() => setShowHireModal(false)}
                disabled={submittingTrainer}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.modalSubmitBtn} 
                onPress={handleHireSubmit}
                disabled={submittingTrainer}
              >
                {submittingTrainer ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : (
                  <Text style={styles.modalSubmitText}>
                    {hireMethod === 'manual' ? 'Save to Roster' : 'Dispatch Invite'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* =======================================================
          MODAL 2: FULL VIEW TRAINER PROFILE MODAL
          ======================================================= */}
      <Modal visible={showViewModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Trainer Profile Details</Text>
              <TouchableOpacity onPress={() => setShowViewModal(false)}>
                <Ionicons name="close" size={22} color={COLORS.textMedium} />
              </TouchableOpacity>
            </View>

            {selectedTrainer && (
              <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator={false}>
                <View style={styles.profileHeaderCard}>
                  <View style={styles.largeAvatar}>
                    <Text style={styles.largeAvatarText}>{selectedTrainer.name.charAt(0).toUpperCase()}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.profileNameText}>{selectedTrainer.name}</Text>
                    <Text style={styles.profileSubText}>{selectedTrainer.specialization || 'Fitness Trainer'}</Text>
                    <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}>
                      <View style={[styles.statusBadge, selectedTrainer.status === 'Active' ? styles.statusBadgeActive : styles.statusBadgeSuspended]}>
                        <Text style={[styles.statusBadgeText, selectedTrainer.status === 'Active' ? styles.statusBadgeTextActive : styles.statusBadgeTextSuspended]}>
                          {selectedTrainer.status}
                        </Text>
                      </View>
                      <View style={styles.modePill}>
                        <Text style={styles.modePillText}>{selectedTrainer.trainingMode || 'both'}</Text>
                      </View>
                    </View>
                  </View>
                </View>

                <View style={styles.profileSection}>
                  <Text style={styles.profileSectionTitle}>CONTACT INFORMATION</Text>
                  <View style={styles.profileDataRow}>
                    <Text style={styles.profileDataLabel}>Email</Text>
                    <Text style={styles.profileDataVal}>{selectedTrainer.email}</Text>
                  </View>
                  <View style={styles.profileDataRow}>
                    <Text style={styles.profileDataLabel}>Phone</Text>
                    <Text style={styles.profileDataVal}>{selectedTrainer.phone || 'Not provided'}</Text>
                  </View>
                  <View style={styles.profileDataRow}>
                    <Text style={styles.profileDataLabel}>Branch</Text>
                    <Text style={styles.profileDataVal}>{selectedTrainer.branchName || user?.branchName || 'Main Arena'}</Text>
                  </View>
                </View>

                <View style={styles.profileSection}>
                  <Text style={styles.profileSectionTitle}>COMPENSATION & SPECIALIZATION</Text>
                  <View style={styles.profileDataRow}>
                    <Text style={styles.profileDataLabel}>Fee</Text>
                    <Text style={styles.profileDataVal}>
                      {selectedTrainer.fee ? `₹${Number(selectedTrainer.fee).toLocaleString()} / ${selectedTrainer.paymentType || 'mo'}` : 'Not configured'}
                    </Text>
                  </View>
                  <View style={styles.profileDataRow}>
                    <Text style={styles.profileDataLabel}>Experience</Text>
                    <Text style={styles.profileDataVal}>{selectedTrainer.experience || '2+ Years'}</Text>
                  </View>
                  <View style={styles.profileDataRow}>
                    <Text style={styles.profileDataLabel}>Qualifications</Text>
                    <Text style={styles.profileDataVal}>{selectedTrainer.qualifications || 'Certified Gym Coach'}</Text>
                  </View>
                  <View style={styles.profileDataRow}>
                    <Text style={styles.profileDataLabel}>Certifications</Text>
                    <Text style={styles.profileDataVal}>{selectedTrainer.certifications || 'CPR, ACE Fitness Certified'}</Text>
                  </View>
                </View>

                <View style={styles.profileSection}>
                  <Text style={styles.profileSectionTitle}>AVAILABILITY SCHEDULE</Text>
                  <View style={styles.profileDataRow}>
                    <Text style={styles.profileDataLabel}>Working Days</Text>
                    <Text style={styles.profileDataVal}>{selectedTrainer.availableDays || 'Monday to Friday'}</Text>
                  </View>
                  <View style={styles.profileDataRow}>
                    <Text style={styles.profileDataLabel}>Working Hours</Text>
                    <Text style={styles.profileDataVal}>
                      {selectedTrainer.availableStartTime || '06:00 AM'} - {selectedTrainer.availableEndTime || '08:00 PM'}
                    </Text>
                  </View>
                </View>
              </ScrollView>
            )}

            <View style={[styles.modalActions, { gap: 10 }]}>
              <TouchableOpacity 
                style={[styles.modalSubmitBtn, { flex: 1.5, backgroundColor: COLORS.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }]} 
                onPress={() => {
                  if (selectedTrainer) handleDownloadTrainerAgreement(selectedTrainer);
                }}
              >
                <Ionicons name="download-outline" size={16} color="#FFFFFF" />
                <Text style={styles.modalSubmitText}>Download Agreement (PDF)</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalCancelBtn, { flex: 0.7, alignItems: 'center', justifyContent: 'center' }]} 
                onPress={() => setShowViewModal(false)}
              >
                <Text style={styles.modalCancelText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* =======================================================
          MODAL 3: EDIT TRAINER PROFILE MODAL
          ======================================================= */}
      <Modal visible={showEditModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Trainer Profile</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <Ionicons name="close" size={22} color={COLORS.textMedium} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Full Name *</Text>
              <TextInput
                style={styles.modalInput}
                value={editForm.name}
                onChangeText={(v) => setEditForm({ ...editForm, name: v })}
              />

              <Text style={styles.inputLabel}>Email Address *</Text>
              <TextInput
                style={styles.modalInput}
                value={editForm.email}
                onChangeText={(v) => setEditForm({ ...editForm, email: v })}
                keyboardType="email-address"
              />

              <Text style={styles.inputLabel}>Mobile Phone *</Text>
              <TextInput
                style={styles.modalInput}
                value={editForm.phone}
                onChangeText={(v) => setEditForm({ ...editForm, phone: v })}
                keyboardType="phone-pad"
              />

              <Text style={styles.inputLabel}>Specialization</Text>
              <TextInput
                style={styles.modalInput}
                value={editForm.specialization}
                onChangeText={(v) => setEditForm({ ...editForm, specialization: v })}
              />

              <Text style={styles.inputLabel}>Training Mode</Text>
              <View style={styles.typeSelectorRow}>
                {['offline', 'online', 'both'].map((m) => (
                  <TouchableOpacity
                    key={m}
                    style={[styles.typeChip, editForm.trainingMode === m && styles.typeChipActive]}
                    onPress={() => setEditForm({ ...editForm, trainingMode: m })}
                  >
                    <Text style={[styles.typeChipText, editForm.trainingMode === m && styles.typeChipTextActive]}>
                      {m.charAt(0).toUpperCase() + m.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.twoColRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Fee Amount (₹)</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={editForm.fee}
                    onChangeText={(v) => setEditForm({ ...editForm, fee: v })}
                    keyboardType="numeric"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Billing Cycle</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={editForm.paymentType}
                    onChangeText={(v) => setEditForm({ ...editForm, paymentType: v })}
                  />
                </View>
              </View>

              <Text style={styles.inputLabel}>Experience</Text>
              <TextInput
                style={styles.modalInput}
                value={editForm.experience}
                onChangeText={(v) => setEditForm({ ...editForm, experience: v })}
              />

              <Text style={styles.inputLabel}>Qualifications</Text>
              <TextInput
                style={styles.modalInput}
                value={editForm.qualifications}
                onChangeText={(v) => setEditForm({ ...editForm, qualifications: v })}
              />

              <Text style={styles.inputLabel}>Certifications</Text>
              <TextInput
                style={styles.modalInput}
                value={editForm.certifications}
                onChangeText={(v) => setEditForm({ ...editForm, certifications: v })}
              />
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.modalCancelBtn} 
                onPress={() => setShowEditModal(false)}
                disabled={updatingTrainer}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.modalSubmitBtn} 
                onPress={handleEditSubmit}
                disabled={updatingTrainer}
              >
                {updatingTrainer ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : (
                  <Text style={styles.modalSubmitText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* =======================================================
          MODAL 4: CONFIGURE FEE MODAL
          ======================================================= */}
      <Modal visible={showFeeModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Set Trainer Compensation</Text>
              <TouchableOpacity onPress={() => setShowFeeModal(false)}>
                <Ionicons name="close" size={22} color={COLORS.textMedium} />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Fee Amount (₹)</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. 25000"
              placeholderTextColor={COLORS.textMuted}
              value={feeForm.fee}
              onChangeText={(v) => setFeeForm({ ...feeForm, fee: v })}
              keyboardType="numeric"
            />

            <Text style={styles.inputLabel}>Billing Cycle</Text>
            <View style={styles.typeSelectorRow}>
              {['Per Month', 'Per Week', 'Per Session'].map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[styles.typeChip, feeForm.paymentType === c && styles.typeChipActive]}
                  onPress={() => setFeeForm({ ...feeForm, paymentType: c })}
                >
                  <Text style={[styles.typeChipText, feeForm.paymentType === c && styles.typeChipTextActive]}>
                    {c}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.modalCancelBtn} 
                onPress={() => setShowFeeModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.modalSubmitBtn} 
                onPress={handleSaveFee}
              >
                <Text style={styles.modalSubmitText}>Save Fee</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* =======================================================
          MODAL 5: CANDIDATE APPLICATION MODAL
          ======================================================= */}
      <Modal visible={showAppModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Candidate Application</Text>
              <TouchableOpacity onPress={() => setShowAppModal(false)}>
                <Ionicons name="close" size={22} color={COLORS.textMedium} />
              </TouchableOpacity>
            </View>

            {selectedApplication && (
              <ScrollView style={{ maxHeight: 380 }} showsVerticalScrollIndicator={false}>
                <Text style={styles.profileNameText}>
                  {selectedApplication.fullName || selectedApplication.name || 'Candidate'}
                </Text>
                <Text style={styles.profileSubText}>
                  Applied for: {selectedApplication.jobId?.title || selectedApplication.role || 'Fitness Trainer'}
                </Text>

                <View style={styles.profileSection}>
                  <Text style={styles.profileSectionTitle}>CONTACT & DETAILS</Text>
                  <View style={styles.profileDataRow}>
                    <Text style={styles.profileDataLabel}>Email</Text>
                    <Text style={styles.profileDataVal}>{selectedApplication.email}</Text>
                  </View>
                  <View style={styles.profileDataRow}>
                    <Text style={styles.profileDataLabel}>Phone</Text>
                    <Text style={styles.profileDataVal}>{selectedApplication.phone || 'N/A'}</Text>
                  </View>
                  <View style={styles.profileDataRow}>
                    <Text style={styles.profileDataLabel}>Experience</Text>
                    <Text style={styles.profileDataVal}>
                      {selectedApplication.yearsOfExperience || selectedApplication.workExperience || '2 Years'}
                    </Text>
                  </View>
                  <View style={styles.profileDataRow}>
                    <Text style={styles.profileDataLabel}>Expected Salary</Text>
                    <Text style={styles.profileDataVal}>
                      {selectedApplication.expectedSalary ? `₹${selectedApplication.expectedSalary}` : 'Negotiable'}
                    </Text>
                  </View>
                </View>

                {selectedApplication.coverLetter ? (
                  <View style={styles.profileSection}>
                    <Text style={styles.profileSectionTitle}>COVER LETTER</Text>
                    <Text style={styles.profileDataVal}>{selectedApplication.coverLetter}</Text>
                  </View>
                ) : null}
              </ScrollView>
            )}

            <View style={[styles.modalActions, { gap: 8 }]}>
              <TouchableOpacity 
                style={[styles.modalSubmitBtn, { flex: 1.2, backgroundColor: COLORS.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 }]}
                onPress={() => {
                  if (selectedApplication) handleDownloadApplicationPDF(selectedApplication);
                }}
              >
                <Ionicons name="download-outline" size={14} color="#FFFFFF" />
                <Text style={styles.modalSubmitText}>PDF Summary</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalSubmitBtn, { flex: 1, backgroundColor: '#15803D' }]}
                onPress={() => handleUpdateAppStatus(
                  selectedApplication?._id || selectedApplication?.id,
                  selectedApplication?.fullName || selectedApplication?.name,
                  'Hired'
                )}
              >
                <Text style={styles.modalSubmitText}>Hire Trainer</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalCancelBtn, { flex: 0.8, alignItems: 'center', justifyContent: 'center' }]}
                onPress={() => setShowAppModal(false)}
              >
                <Text style={styles.modalCancelText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F8FAFC' 
  },
  scrollArea: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  loadingBox: {
    paddingVertical: 40,
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  // Top Segment Container
  topSegmentContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    padding: 6,
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  topSegmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 10,
    gap: 6,
  },
  topSegmentBtnActive: {
    backgroundColor: '#FFF7ED',
  },
  topSegmentText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  topSegmentTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  // Sub-tabs scrollable pill bar
  subTabsScroll: {
    marginBottom: 12,
  },
  subTabsContainer: {
    flexDirection: 'row',
    gap: 6,
    paddingVertical: 2,
  },
  subTabPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  subTabPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  subTabPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMedium,
  },
  subTabPillTextActive: {
    color: COLORS.white,
    fontWeight: '700',
  },
  // Page Header
  pageHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 8,
  },
  pageHeaderTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.3,
  },
  pageHeaderSub: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  hireBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 12,
  },
  hireBtnText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '700',
  },
  // Search bar & Filters
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    color: '#111827',
    padding: 0,
  },
  filterScroll: {
    marginBottom: 12,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: 6,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  filterChipTextActive: {
    color: COLORS.white,
    fontWeight: '700',
  },
  // Trainer Cards
  trainersList: {
    gap: 10,
  },
  trainerCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primary,
  },
  cardHeaderInfo: {
    flex: 1,
  },
  trainerNameText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  trainerEmailText: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  trainerPhoneText: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  // Status Badges
  statusBadge: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  statusBadgeActive: {
    backgroundColor: '#DCFCE7',
    borderColor: '#BBF7D0',
  },
  statusBadgeSuspended: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FECACA',
  },
  statusBadgePending: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
  },
  statusBadgeRejected: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  statusBadgeTextActive: {
    color: '#15803D',
  },
  statusBadgeTextSuspended: {
    color: '#DC2626',
  },
  statusBadgeTextPending: {
    color: '#D97706',
  },
  statusBadgeTextRejected: {
    color: COLORS.textMuted,
  },
  // Card Details Row
  cardDetailsBox: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 8,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 11,
    fontWeight: '600',
    color: '#111827',
  },
  modePill: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  modePillText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primary,
  },
  feeValue: {
    fontSize: 11,
    fontWeight: '700',
    color: '#111827',
  },
  feeCycle: {
    fontSize: 9,
    fontWeight: '400',
    color: COLORS.textMuted,
  },
  feeNotConfigured: {
    fontSize: 10,
    fontStyle: 'italic',
    color: COLORS.textMuted,
  },
  // Action Toolbar Row
  cardActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  actionIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusIconsCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 4,
  },
  statusIconBtn: {
    padding: 4,
  },
  statusIconBtnCurrent: {
    backgroundColor: '#FFF7ED',
    borderRadius: 6,
  },
  actionCallBtn: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
  },
  actionCallText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  // KPI Overview Cards
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  kpiCard: {
    width: (width - 40) / 2,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  kpiIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiLabel: {
    fontSize: 8,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
  kpiValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  // Job Vacancy Cards
  jobCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  jobTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  jobTitleText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  jobTypeText: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  jobMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  jobMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  jobMetaText: {
    fontSize: 11,
    color: '#334155',
    fontWeight: '500',
  },
  jobSkillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  skillTag: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  skillTagText: {
    fontSize: 9,
    fontWeight: '600',
    color: COLORS.textMedium,
  },
  jobFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  jobAppCounterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  jobAppCounterText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primary,
  },
  toggleJobStatusBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
  },
  toggleJobStatusBtnClose: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  toggleJobStatusText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  toggleJobStatusTextClose: {
    color: '#DC2626',
  },
  // Post Job Form
  postJobCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  postFormTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  postFormSub: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginBottom: 12,
  },
  typeSelectorRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 10,
  },
  typeChip: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  typeChipActive: {
    backgroundColor: '#FFF7ED',
    borderColor: COLORS.primary,
  },
  typeChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMedium,
  },
  typeChipTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  twoColRow: {
    flexDirection: 'row',
    gap: 10,
  },
  skillsTagCloud: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  skillChipSelect: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  skillChipSelectActive: {
    backgroundColor: '#FFF7ED',
    borderColor: COLORS.primary,
  },
  skillChipSelectText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  skillChipSelectTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  formActionButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  saveDraftBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  saveDraftBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textMedium,
  },
  publishBtn: {
    flex: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    paddingVertical: 11,
    borderRadius: 12,
  },
  publishBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.white,
  },
  // Config Fee button
  configFeeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
  },
  configFeeBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  payNowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 6,
  },
  payNowBtnText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '700',
  },
  // Empty State Box
  emptyCardBox: {
    paddingVertical: 32,
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  emptyCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  emptyCardText: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'center',
    maxWidth: 260,
  },
  // Modals Styling
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 32,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 4,
    marginTop: 8,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 12,
    color: '#111827',
    backgroundColor: '#F8FAFC',
  },
  methodToggleRow: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    padding: 3,
    marginBottom: 10,
  },
  methodToggleBtn: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: 8,
  },
  methodToggleBtnActive: {
    backgroundColor: COLORS.white,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  methodToggleText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  methodToggleTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMedium,
  },
  modalSubmitBtn: {
    flex: 1.5,
    backgroundColor: COLORS.primary,
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSubmitText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.white,
  },
  // View Profile Modal specifics
  profileHeaderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  largeAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFF7ED',
    borderWidth: 1.5,
    borderColor: '#FFEDD5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  largeAvatarText: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.primary,
  },
  profileNameText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  profileSubText: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  profileSection: {
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  profileSectionTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  profileDataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  profileDataLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  profileDataVal: {
    fontSize: 11,
    fontWeight: '600',
    color: '#111827',
    maxWidth: '65%',
    textAlign: 'right',
  },
  // Web-Matching Trainer Hiring & Vacancies Styles
  searchSubmitBtn: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  searchSubmitBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  jobTopTagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
    marginBottom: 6,
  },
  jobVacancyStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  jobVacancyOverPill: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  jobVacancyPublishedPill: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  jobVacancyDraftPill: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  jobVacancyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  jobVacancyStatusText: {
    fontSize: 10,
    fontWeight: '800',
  },
  jobVacancyOverText: {
    color: '#DC2626',
  },
  jobVacancyPublishedText: {
    color: '#059669',
  },
  jobVacancyDraftText: {
    color: '#D97706',
  },
  jobEmploymentPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  jobEmploymentText: {
    fontSize: 10,
    color: '#475569',
    fontWeight: '600',
  },
  jobLocationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FFEDD5',
  },
  jobLocationText: {
    fontSize: 10,
    color: '#EA580C',
    fontWeight: '700',
    maxWidth: 160,
  },
  webJobTitleText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.2,
    marginBottom: 4,
  },
  jobMetaDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  jobSalaryBoldText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  jobMetaDivider: {
    color: '#CBD5E1',
    fontSize: 12,
  },
  jobMetaSecondaryText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  jobDeadlineText: {
    fontSize: 11,
    color: '#64748B',
  },
  skillTagOrange: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  skillTagOrangeText: {
    fontSize: 10,
    color: '#C2410C',
    fontWeight: '700',
  },
  jobBottomActionCard: {
    marginTop: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 10,
  },
  jobCountersRow: {
    flexDirection: 'row',
    gap: 8,
  },
  jobMetricBox: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 8,
    alignItems: 'center',
  },
  jobMetricVal: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0F172A',
  },
  jobMetricLbl: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
    marginTop: 1,
    letterSpacing: 0.4,
  },
  jobCardButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toggleJobStatusBtnReopen: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FED7AA',
  },
  toggleJobStatusTextReopen: {
    color: '#EA580C',
  },
  jobActionIconBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  postJobWrapper: {
    gap: 12,
  },
  postBackHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  postBackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  postBackBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  postGymTagText: {
    fontSize: 11,
    color: '#64748B',
  },
  postFormHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 12,
    marginBottom: 6,
  },
  postFormIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedGymBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  verifiedGymNameText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  verifiedGymBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  verifiedGymBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669',
  },
  threeColRow: {
    flexDirection: 'row',
    gap: 8,
  },
  typeChipSmall: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  typeChipSmallActive: {
    backgroundColor: '#EA580C',
    borderColor: '#EA580C',
  },
  typeChipSmallText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  typeChipSmallTextActive: {
    color: '#FFFFFF',
  },
  fieldHintSub: {
    fontSize: 10,
    color: '#94A3B8',
    marginBottom: 6,
  },
  trainingModeCardsRow: {
    flexDirection: 'column',
    gap: 8,
  },
  modeBigCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    padding: 12,
    gap: 4,
  },
  modeBigCardActive: {
    backgroundColor: '#FFF7ED',
    borderColor: '#EA580C',
  },
  modeBigCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modeBigCardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  modeBigCardTitleActive: {
    color: '#EA580C',
  },
  modeBigCardDesc: {
    fontSize: 11,
    color: '#64748B',
    marginLeft: 26,
  },
  salarySectionBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    gap: 8,
    marginTop: 8,
  },
  salarySectionTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  salarySectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  negotiableCheckRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  negotiableCheckText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
  },
  deadlineHintText: {
    fontSize: 10,
    color: '#94A3B8',
    fontStyle: 'italic',
    marginTop: 2,
    marginBottom: 6,
  },
  applicationsHeaderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  applicationCardWeb: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    gap: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  appWebTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  appCandidateName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  appContactLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 3,
  },
  appEmailText: {
    fontSize: 11,
    color: '#64748B',
  },
  appPhoneText: {
    fontSize: 11,
    color: '#64748B',
  },
  appWebStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  appStatusShortlistedPill: {
    backgroundColor: '#FAF5FF',
    borderColor: '#E9D5FF',
  },
  appStatusHiredPill: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  appStatusRejectedPill: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  appStatusAppliedPill: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  appStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  appWebStatusText: {
    fontSize: 10,
    fontWeight: '800',
  },
  appStatusShortlistedText: {
    color: '#9333EA',
  },
  appStatusHiredText: {
    color: '#059669',
  },
  appStatusRejectedText: {
    color: '#DC2626',
  },
  appStatusAppliedText: {
    color: '#D97706',
  },
  appWebGrid: {
    flexDirection: 'column',
    gap: 8,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  appWebGridCol: {
    gap: 2,
  },
  appGridLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.4,
  },
  appGridValBold: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  appGridValSub: {
    fontSize: 11,
    color: '#64748B',
  },
  appExpertiseBadge: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  appExpertiseBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#C2410C',
  },
  appWebActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  appReviewBtn: {
    flex: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingVertical: 8,
  },
  appReviewBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F172A',
  },
  appShortlistBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAF5FF',
    borderWidth: 1,
    borderColor: '#E9D5FF',
    borderRadius: 8,
    paddingVertical: 8,
  },
  appShortlistBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9333EA',
  },
  appHireBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 8,
    paddingVertical: 8,
  },
  appHireBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  appCallBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
});
