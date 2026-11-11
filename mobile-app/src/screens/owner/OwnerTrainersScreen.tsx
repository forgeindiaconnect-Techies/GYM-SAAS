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
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { sanitizeTenDigitPhone } from '../../utils/phoneUtils';
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

const TRAINING_TYPES = ['Online Training', 'Offline Training', 'Hybrid Training'];
const BILLING_CYCLES = ['Weekly', 'Monthly', 'Per Session'];
const UPI_APPS = [
  { name: 'Google Pay', handle: 'okaxis' },
  { name: 'PhonePe', handle: 'ybl' },
  { name: 'Paytm', handle: 'paytm' },
  { name: 'BHIM / UPI', handle: 'upi' },
];

export const OwnerTrainersScreen: React.FC<{ initialTab?: 'trainers' | 'hiring' }> = ({ initialTab = 'trainers' }) => {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  
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
  const [trainerFees, setTrainerFees] = useState<any[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Suspended' | 'Pending' | 'Rejected'>('All');

  // Fee / Payment / History Search & Filters
  const [feeSearchQuery, setFeeSearchQuery] = useState('');
  const [paymentSearchQuery, setPaymentSearchQuery] = useState('');
  const [historySearchQuery, setHistorySearchQuery] = useState('');
  const [historyStatusFilter, setHistoryStatusFilter] = useState<'All' | 'Paid' | 'Pending' | 'Failed' | 'Cancelled'>('All');
  const [historyMethodFilter, setHistoryMethodFilter] = useState<'All' | 'Bank Transfer' | 'UPI' | 'Cash'>('All');

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
  const [editingFeeRecord, setEditingFeeRecord] = useState<any>(null);
  const [savingFee, setSavingFee] = useState(false);
  const [showProcessPaymentModal, setShowProcessPaymentModal] = useState(false);
  const [selectedPaymentFee, setSelectedPaymentFee] = useState<any>(null);
  const [showQrCode, setShowQrCode] = useState(false);
  const [savingPayment, setSavingPayment] = useState(false);
  const [selectedPaymentDetail, setSelectedPaymentDetail] = useState<any>(null);
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

  // Form state for Post Job (Matching Web GymAdminPostJob.tsx)
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [customExpertiseInput, setCustomExpertiseInput] = useState('');
  const [gymData, setGymData] = useState<any>(null);
  const [postJobForm, setPostJobForm] = useState({
    title: '',
    gymName: user?.gymName || 'Your Gym',
    employmentType: 'Full-time',
    trainingMode: 'Offline' as 'Offline' | 'Online' | 'Hybrid',
    experience: '1-2 Years',
    vacanciesCount: '1',
    salaryMin: '',
    salaryMax: '',
    salaryType: 'Monthly',
    isSalaryNegotiable: false,
    location: '',
    workingHours: '',
    deadline: '',
    description: '',
    responsibilities: '',
    qualifications: '',
    certifications: '',
    expertise: [] as string[]
  });
  const [publishingJob, setPublishingJob] = useState(false);

  // Web-Matching Fee Configuration State
  const [feeForm, setFeeForm] = useState({
    trainerId: '',
    trainingType: 'Online Training',
    feeAmount: '',
    billingCycle: 'Monthly',
    effectiveFrom: new Date().toISOString().slice(0, 10),
    paymentMethod: 'Bank Transfer',
    status: 'Active',
    notes: '',
    accountHolder: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    upiId: '',
    upiName: ''
  });

  // Web-Matching Process Trainer Payment Form State
  const [processPaymentForm, setProcessPaymentForm] = useState({
    trainerId: '',
    trainerFeeId: '',
    amount: '',
    paymentMethod: 'Bank Transfer',
    transactionId: '',
    paymentDate: new Date().toISOString().slice(0, 10),
    accountHolder: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    upiId: '',
    upiName: '',
    upiApp: 'Google Pay',
    handedOverTo: '',
    notes: ''
  });

  // Fetch all data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const branchParam = user?.branchId ? `?branchId=${user.branchId}` : '';

      const [trainersRes, jobsRes, appsRes, hiredRes, feesRes, historyRes, gymRes] = await Promise.allSettled([
        api.get(`/trainers${branchParam}`),
        api.get(`/hiring/owner/jobs${branchParam}`).catch(() => api.get(`/hiring/jobs${branchParam}`)),
        api.get(`/hiring/admin/applications${branchParam}`).catch(() => api.get(`/hiring/applications${branchParam}`)),
        api.get(`/hiring/owner/hired${branchParam}`).catch(() => api.get(`/hiring/hired${branchParam}`)),
        api.get(`/trainer-payments/fees${branchParam}`),
        api.get(`/trainer-payments/history${branchParam}`),
        user?.gymId ? api.get(`/gyms/${user.gymId}`) : Promise.resolve(null as any)
      ]);

      if (gymRes.status === 'fulfilled' && gymRes.value?.data?.gym) {
        const g = gymRes.value.data.gym;
        setGymData(g);
        const gymLoc = g.location?.address || g.location?.city || g.address || '';
        setPostJobForm((prev) => ({
          ...prev,
          gymName: g.name || prev.gymName,
          location: prev.location || gymLoc,
        }));
      }

      let mergedTrainersList: any[] = [];
      let feeList: any[] = [];

      if (feesRes.status === 'fulfilled' && feesRes.value?.data) {
        feeList = feesRes.value.data.fees || [];
        if (Array.isArray(feesRes.value.data.trainers)) {
          mergedTrainersList = [...feesRes.value.data.trainers];
        }
      }

      if (trainersRes.status === 'fulfilled' && trainersRes.value.data) {
        const directTrainers = trainersRes.value.data.trainers || [];
        const existingMap = new Map<string, any>();
        for (const mt of mergedTrainersList) {
          if (mt?._id || mt?.id) {
            existingMap.set(String(mt._id || mt.id), mt);
          }
        }
        // Prefer richer objects from /trainers endpoint while keeping fee-only entries
        for (const dt of directTrainers) {
          const id = String(dt._id || dt.id);
          existingMap.set(id, { ...(existingMap.get(id) || {}), ...dt });
        }
        mergedTrainersList = Array.from(existingMap.values());
        setInvitations(trainersRes.value.data.invitations || []);
      }

      const existingIds = new Set(mergedTrainersList.map(t => String(t._id || t.id)));
      feeList.forEach(f => {
        if (f.trainerId && typeof f.trainerId === 'object' && f.trainerId._id) {
          const id = String(f.trainerId._id);
          if (!existingIds.has(id)) {
            mergedTrainersList.push(f.trainerId);
            existingIds.add(id);
          }
        }
      });

      setTrainerFees(feeList);
      setTrainers(mergedTrainersList.map((t: any) => ({
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
        branchName: t.branchName || user?.branchName || 'Main Arena',
        createdAt: t.createdAt
      })));

      if (historyRes.status === 'fulfilled' && historyRes.value?.data) {
        setPaymentHistory(historyRes.value.data.payments || []);
      } else {
        setPaymentHistory([]);
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

  // Unified Trainer Fees rows (exact parity with GymAdminTrainerFees.tsx)
  const feeMap = useMemo(() => {
    return new Map(
      trainerFees.map(f => [
        String(f.trainerId?._id || f.trainerId),
        f
      ])
    );
  }, [trainerFees]);

  const getEffectiveFee = useCallback((trainer: any, feeRecord: any) => {
    if (feeRecord) return feeRecord;
    if (trainer && trainer.fee && Number(trainer.fee) > 0) {
      const modeMap: Record<string, string> = {
        online: 'Online Training',
        offline: 'Offline Training',
        both: 'Hybrid Training'
      };
      const cycleMap: Record<string, string> = {
        'Per Week': 'Weekly',
        'Per Month': 'Monthly',
        'Per Session': 'Per Session'
      };
      return {
        _id: null,
        trainerId: trainer,
        trainingType: modeMap[trainer.trainingMode] || 'Offline Training',
        feeAmount: Number(trainer.fee),
        billingCycle: cycleMap[trainer.paymentType] || 'Monthly',
        paymentMethod: 'Bank Transfer',
        effectiveFrom: trainer.createdAt || new Date().toISOString(),
        status: trainer.status === 'Active' ? 'Active' : 'Pending',
        isSyncedFromProfile: true
      };
    }
    return null;
  }, []);

  const allFeeRows = useMemo(() => {
    return trainers.map(t => {
      const feeRecord = feeMap.get(String(t._id)) || null;
      return {
        trainer: t,
        fee: getEffectiveFee(t, feeRecord),
        rawFee: feeRecord
      };
    });
  }, [trainers, feeMap, getEffectiveFee]);

  const filteredFeeRows = useMemo(() => {
    const q = feeSearchQuery.trim().toLowerCase();
    if (!q) return allFeeRows;
    return allFeeRows.filter(row =>
      row.trainer.name?.toLowerCase().includes(q) ||
      row.trainer.email?.toLowerCase().includes(q)
    );
  }, [allFeeRows, feeSearchQuery]);

  const configuredFeeCount = useMemo(() => allFeeRows.filter(r => r.fee !== null).length, [allFeeRows]);
  const pendingFeeCount = useMemo(() => allFeeRows.length - configuredFeeCount, [allFeeRows, configuredFeeCount]);

  // Active fees for Trainer Payments tab (exact parity with GymAdminTrainerPayments.tsx)
  const activePaymentFees = useMemo(() => {
    const active = trainerFees.filter(f => f.status === 'Active');
    const q = paymentSearchQuery.trim().toLowerCase();
    if (!q) return active;
    return active.filter(f => (f.trainerId?.name || '').toLowerCase().includes(q));
  }, [trainerFees, paymentSearchQuery]);

  // Payment History filtered & Total Paid Out (exact parity with GymAdminTrainerPaymentHistory.tsx)
  const filteredPaymentHistory = useMemo(() => {
    const q = historySearchQuery.trim().toLowerCase();
    return paymentHistory.filter(p => {
      const name = (p.trainerId?.name || '').toLowerCase();
      const matchSearch = !q || name.includes(q);
      const matchStatus = historyStatusFilter === 'All' || p.paymentStatus === historyStatusFilter;
      const matchMethod = historyMethodFilter === 'All' || p.paymentMethod === historyMethodFilter;
      return matchSearch && matchStatus && matchMethod;
    });
  }, [paymentHistory, historySearchQuery, historyStatusFilter, historyMethodFilter]);

  const totalPaidOut = useMemo(() => {
    return filteredPaymentHistory
      .filter(p => p.paymentStatus === 'Paid')
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  }, [filteredPaymentHistory]);

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
              const payload: any = { status: newStatus };
              if (newStatus === 'Rejected') {
                payload.reason = 'Rejected by gym owner';
              }
              await api.patch(`/trainers/${trainerId}/status`, payload);
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

    const cleanEditPhone = editForm.phone ? editForm.phone.replace(/\D/g, '') : '';
    if (editForm.phone && cleanEditPhone.length !== 10) {
      Alert.alert('Validation Error', 'Mobile phone must be exactly 10 digits.');
      return;
    }

    try {
      setUpdatingTrainer(true);
      await api.put(`/trainers/${selectedTrainer._id}`, {
        ...editForm,
        phone: cleanEditPhone || undefined
      });
      setTrainers(prev => prev.map(t => t._id === selectedTrainer._id ? {
        ...t,
        ...editForm,
        phone: cleanEditPhone || undefined,
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

  const openSetFeeModal = (trainer: any) => {
    setSelectedTrainer(trainer);
    setEditingFeeRecord(null);
    const modeMap: Record<string, string> = {
      online: 'Online Training',
      offline: 'Offline Training',
      both: 'Hybrid Training'
    };
    const cycleMap: Record<string, string> = {
      'Per Week': 'Weekly',
      'Per Month': 'Monthly',
      'Per Session': 'Per Session'
    };
    setFeeForm({
      trainerId: String(trainer._id),
      trainingType: modeMap[trainer.trainingMode] || 'Offline Training',
      feeAmount: trainer.fee ? String(trainer.fee) : '',
      billingCycle: cycleMap[trainer.paymentType] || 'Monthly',
      effectiveFrom: trainer.createdAt ? new Date(trainer.createdAt).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
      paymentMethod: 'Bank Transfer',
      status: 'Active',
      notes: '',
      accountHolder: trainer.name || '',
      bankName: '',
      accountNumber: '',
      ifscCode: '',
      upiId: trainer.phone ? `${trainer.phone}@paytm` : '',
      upiName: trainer.name || ''
    });
    setShowFeeModal(true);
  };

  const openEditFeeModal = (fee: any, trainer?: any) => {
    const tr = trainer || fee?.trainerId;
    setSelectedTrainer(tr || null);
    setEditingFeeRecord(fee?._id ? fee : null);
    setFeeForm({
      trainerId: String(fee?.trainerId?._id || fee?.trainerId || tr?._id || ''),
      trainingType: fee?.trainingType || 'Offline Training',
      feeAmount: fee?.feeAmount ? String(fee.feeAmount) : (tr?.fee ? String(tr.fee) : ''),
      billingCycle: fee?.billingCycle || 'Monthly',
      effectiveFrom: fee?.effectiveFrom ? new Date(fee.effectiveFrom).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
      paymentMethod: fee?.paymentMethod || 'Bank Transfer',
      status: fee?.status || 'Active',
      notes: fee?.notes || '',
      accountHolder: fee?.bankDetails?.accountHolder || tr?.name || '',
      bankName: fee?.bankDetails?.bankName || '',
      accountNumber: fee?.bankDetails?.accountNumber || '',
      ifscCode: fee?.bankDetails?.ifscCode || '',
      upiId: fee?.upiDetails?.upiId || (tr?.phone ? `${tr.phone}@paytm` : ''),
      upiName: fee?.upiDetails?.upiName || tr?.name || ''
    });
    setShowFeeModal(true);
  };

  const openAddNewFeeModal = () => {
    setSelectedTrainer(null);
    setEditingFeeRecord(null);
    setFeeForm({
      trainerId: '',
      trainingType: 'Online Training',
      feeAmount: '',
      billingCycle: 'Monthly',
      effectiveFrom: new Date().toISOString().slice(0, 10),
      paymentMethod: 'Bank Transfer',
      status: 'Active',
      notes: '',
      accountHolder: '',
      bankName: '',
      accountNumber: '',
      ifscCode: '',
      upiId: '',
      upiName: ''
    });
    setShowFeeModal(true);
  };

  const handleSaveFee = async () => {
    if (!feeForm.trainerId || !feeForm.feeAmount || !feeForm.billingCycle || !feeForm.effectiveFrom) {
      Alert.alert('Validation Error', 'Please select a trainer and enter Fee Amount, Billing Cycle, and Effective From date.');
      return;
    }
    const feeNum = Number(feeForm.feeAmount) || 0;
    if (feeNum <= 0) {
      Alert.alert('Validation Error', 'Fee amount must be greater than zero.');
      return;
    }
    try {
      setSavingFee(true);
      await api.post('/trainer-payments/fee', {
        ...feeForm,
        feeAmount: feeNum,
        paymentMethod: feeForm.paymentMethod || 'Bank Transfer',
        commissionType: 'Percentage',
        commissionValue: 0,
        netAmount: feeNum
      });
      setShowFeeModal(false);
      Alert.alert('Success', editingFeeRecord ? 'Trainer fee updated successfully!' : 'Trainer fee set successfully!');
      fetchData();
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to save fee.');
    } finally {
      setSavingFee(false);
    }
  };

  const openProcessPaymentModal = (fee: any) => {
    const trainer = fee.trainerId || {};
    const trainerName = trainer.name || 'Trainer';
    const emailPrefix = trainer.email ? trainer.email.split('@')[0] : 'trainer';
    const trainerPhone = trainer.phone || '';
    const defaultUpi = fee.upiDetails?.upiId || (trainerPhone ? `${trainerPhone}@paytm` : `${emailPrefix}@okaxis`);

    setSelectedPaymentFee(fee);
    setShowQrCode(false);
    setProcessPaymentForm({
      trainerId: String(trainer._id || fee.trainerId || ''),
      trainerFeeId: String(fee._id || ''),
      amount: fee.feeAmount ? String(fee.feeAmount) : '0',
      paymentMethod: fee.paymentMethod || 'Bank Transfer',
      transactionId: '',
      paymentDate: new Date().toISOString().slice(0, 10),
      accountHolder: fee.bankDetails?.accountHolder || trainerName,
      bankName: fee.bankDetails?.bankName || '',
      accountNumber: fee.bankDetails?.accountNumber || '',
      ifscCode: fee.bankDetails?.ifscCode || '',
      upiId: defaultUpi,
      upiName: fee.upiDetails?.upiName || trainerName,
      upiApp: 'Google Pay',
      handedOverTo: trainerName,
      notes: `${fee.billingCycle || 'Monthly'} Trainer fee payment for ${trainerName}`
    });
    setShowProcessPaymentModal(true);
  };

  const handleSelectUpiApp = (app: { name: string; handle: string }) => {
    setProcessPaymentForm(prev => {
      const currentUpi = prev.upiId || '';
      let userPart = currentUpi.includes('@') ? currentUpi.split('@')[0] : currentUpi;
      if (!userPart && selectedPaymentFee?.trainerId) {
        userPart = selectedPaymentFee.trainerId.phone || selectedPaymentFee.trainerId.email?.split('@')[0] || 'trainer';
      }
      return {
        ...prev,
        upiApp: app.name,
        upiId: `${userPart}@${app.handle}`
      };
    });
  };

  const handleProcessPaymentSubmit = async () => {
    const amountNum = Number(processPaymentForm.amount);
    if (!amountNum || amountNum <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid payment amount.');
      return;
    }

    if (processPaymentForm.paymentMethod === 'Bank Transfer') {
      if (processPaymentForm.accountNumber && processPaymentForm.accountNumber.length < 9) {
        Alert.alert('Validation Error', 'Bank account number must be at least 9 digits (9–18 digits).');
        return;
      }
      if (processPaymentForm.ifscCode && processPaymentForm.ifscCode.length < 11) {
        Alert.alert('Validation Error', 'IFSC code must be exactly 11 characters.');
        return;
      }
    }

    if (['Bank Transfer', 'UPI'].includes(processPaymentForm.paymentMethod) && !processPaymentForm.transactionId.trim()) {
      Alert.alert(
        'Transaction ID Required',
        `Please enter the ${processPaymentForm.paymentMethod === 'UPI' ? 'UPI Reference / UTR Number' : 'Bank UTR / Transaction ID'} to confirm this payment.`
      );
      return;
    }

    try {
      setSavingPayment(true);
      const payload: any = {
        trainerId: processPaymentForm.trainerId,
        trainerFeeId: processPaymentForm.trainerFeeId,
        amount: amountNum,
        paymentMethod: processPaymentForm.paymentMethod,
        paymentDate: processPaymentForm.paymentDate,
        notes: processPaymentForm.notes
      };
      if (processPaymentForm.transactionId.trim()) {
        payload.transactionId = processPaymentForm.transactionId.trim();
      }
      await api.post('/trainer-payments/process', payload);
      setShowProcessPaymentModal(false);
      Alert.alert('Success', 'Payment processed and recorded successfully!');
      fetchData();
    } catch (err: any) {
      Alert.alert('Payment Failed', err?.response?.data?.message || 'Failed to process payment.');
    } finally {
      setSavingPayment(false);
    }
  };

  const formatPaymentDateTime = (iso?: string) => {
    if (!iso) return '-';
    try {
      return new Date(iso).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return iso;
    }
  };

  const formatEffectiveDate = (iso?: string) => {
    if (!iso) return '—';
    try {
      return new Date(iso).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return iso;
    }
  };

  const handleDownloadAllPaymentHistoryPDF = async () => {
    try {
      if (filteredPaymentHistory.length === 0) return;
      const headers = ['Date', 'Trainer', 'Training Type', 'Amount (INR)', 'Method', 'Status', 'Transaction ID'];
      const rows = filteredPaymentHistory.map(p => [
        formatPaymentDateTime(p.createdAt || p.paymentDate),
        p.trainerId?.name || 'Unknown',
        p.trainerFeeId?.trainingType || '-',
        `₹${Number(p.amount || 0).toLocaleString('en-IN')}`,
        p.paymentMethod || '-',
        p.paymentStatus || '-',
        p.transactionId || 'N/A'
      ]);
      await FileDownloader.downloadReportPDF({
        title: 'Trainer Payment History',
        subtitle: 'Complete record of all trainer payments',
        gymName: user?.gymName || 'Perfect Fitness Studio',
        summaryMetrics: [
          { label: 'Total Paid Out', value: `₹${totalPaidOut.toLocaleString('en-IN')}` },
          { label: 'Total Transactions', value: String(filteredPaymentHistory.length) }
        ],
        headers,
        rows
      }, 'Trainer_Payment_History');
    } catch (err: any) {
      Alert.alert('Download Error', err?.message || 'Failed to download Payment History PDF.');
    }
  };

  const handleDownloadSinglePaymentReceiptPDF = async (p: any) => {
    try {
      const trainerName = p.trainerId?.name || 'Unknown';
      const dateFormatted = formatPaymentDateTime(p.createdAt || p.paymentDate);
      const receiptId = p.transactionId || p._id?.slice(-8)?.toUpperCase() || 'REC-001';
      await FileDownloader.downloadReportPDF({
        title: 'Trainer Payment Receipt',
        subtitle: `Receipt #: ${receiptId} • Issued ${dateFormatted}`,
        gymName: user?.gymName || 'Perfect Fitness Studio',
        summaryMetrics: [
          { label: 'Amount Paid', value: `₹${Number(p.amount || 0).toLocaleString('en-IN')}` },
          { label: 'Payment Status', value: p.paymentStatus || 'Paid' }
        ],
        headers: ['Payment Information', 'Details'],
        rows: [
          ['Trainer Name', trainerName],
          ['Training Type', p.trainerFeeId?.trainingType || '-'],
          ['Amount Paid', `₹${Number(p.amount || 0).toLocaleString('en-IN')}`],
          ['Payment Method', p.paymentMethod || '-'],
          ['Payment Status', p.paymentStatus || '-'],
          ['Transaction ID', p.transactionId || 'N/A'],
          ['Date & Time', dateFormatted],
          ['Notes / Remarks', p.notes || 'None']
        ]
      }, `Trainer_Receipt_${trainerName.replace(/[^a-zA-Z0-9]/g, '_')}`);
    } catch (err: any) {
      Alert.alert('Download Error', err?.message || 'Failed to download receipt PDF.');
    }
  };

  const handleHireSubmit = async () => {
    if (hireMethod === 'manual') {
      const cleanPhone = manualForm.phone.replace(/\D/g, '');
      if (!manualForm.name.trim() || !manualForm.email.trim()) {
        Alert.alert('Validation Error', 'Name, email, and phone are required.');
        return;
      }
      if (!cleanPhone || cleanPhone.length !== 10) {
        Alert.alert('Invalid Mobile Number', 'Please enter a valid 10-digit mobile number.');
        return;
      }
      try {
        setSubmittingTrainer(true);
        const res = await api.post('/trainers/manual-add', {
          ...manualForm,
          phone: cleanPhone,
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
      const cleanInvitePhone = inviteForm.phone ? inviteForm.phone.replace(/\D/g, '') : '';
      if (inviteForm.phone && cleanInvitePhone.length !== 10) {
        Alert.alert('Invalid Mobile Number', 'If provided, mobile phone must be exactly 10 digits.');
        return;
      }
      try {
        setSubmittingTrainer(true);
        await api.post('/trainers/invite', {
          ...inviteForm,
          phone: cleanInvitePhone || undefined,
        });
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

  const getDefaultGymLocation = () =>
    gymData?.location?.address || gymData?.location?.city || gymData?.address || '';

  const resetPostJobForm = () => {
    setEditingJobId(null);
    setCustomExpertiseInput('');
    setPostJobForm({
      title: '',
      gymName: gymData?.name || user?.gymName || 'Your Gym',
      employmentType: 'Full-time',
      trainingMode: 'Offline',
      experience: '1-2 Years',
      vacanciesCount: '1',
      salaryMin: '',
      salaryMax: '',
      salaryType: 'Monthly',
      isSalaryNegotiable: false,
      location: getDefaultGymLocation(),
      workingHours: '',
      deadline: '',
      description: '',
      responsibilities: '',
      qualifications: '',
      certifications: '',
      expertise: []
    });
  };

  const parseDeadlineDate = (raw: string): Date | undefined => {
    const trimmed = raw.trim();
    if (!trimmed) return undefined;
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      const d = new Date(`${trimmed}T00:00:00`);
      return Number.isNaN(d.getTime()) ? undefined : d;
    }
    const slashMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (slashMatch) {
      const d = new Date(`${slashMatch[3]}-${slashMatch[1].padStart(2, '0')}-${slashMatch[2].padStart(2, '0')}T00:00:00`);
      return Number.isNaN(d.getTime()) ? undefined : d;
    }
    const parsed = new Date(trimmed);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
  };

  const isDeadlineExpired = (raw?: string | Date): boolean => {
    if (!raw) return false;
    const d = raw instanceof Date ? new Date(raw.getTime()) : parseDeadlineDate(String(raw));
    if (!d) return false;
    d.setHours(23, 59, 59, 999);
    return d.getTime() < Date.now();
  };

  const handleAddCustomExpertise = () => {
    const val = customExpertiseInput.trim();
    if (!val) return;
    if (!postJobForm.expertise.includes(val)) {
      setPostJobForm(prev => ({
        ...prev,
        expertise: [...prev.expertise, val]
      }));
    }
    setCustomExpertiseInput('');
  };

  const handlePublishJob = async (status: 'Published' | 'Draft' = 'Published') => {
    if (!postJobForm.title.trim()) {
      Alert.alert('Required', 'Please enter a job title.');
      return;
    }
    if (!postJobForm.description.trim()) {
      Alert.alert('Required', 'Please enter a job description.');
      return;
    }
    if (!postJobForm.location.trim()) {
      Alert.alert('Required', 'Please enter a work location.');
      return;
    }
    try {
      setPublishingJob(true);
      const parsedDeadline = parseDeadlineDate(postJobForm.deadline);
      const payload = {
        title: postJobForm.title.trim(),
        employmentType: postJobForm.employmentType,
        trainingMode: postJobForm.trainingMode,
        experience: postJobForm.experience,
        salaryMin: postJobForm.salaryMin ? Number(postJobForm.salaryMin) : undefined,
        salaryMax: postJobForm.salaryMax ? Number(postJobForm.salaryMax) : undefined,
        salaryType: postJobForm.salaryType,
        isSalaryNegotiable: Boolean(postJobForm.isSalaryNegotiable),
        location: postJobForm.location.trim(),
        workingHours: postJobForm.workingHours.trim(),
        deadline: parsedDeadline,
        vacanciesCount: Math.max(1, Number(postJobForm.vacanciesCount) || 1),
        description: postJobForm.description.trim(),
        responsibilities: postJobForm.responsibilities.trim(),
        qualifications: postJobForm.qualifications.trim(),
        certifications: postJobForm.certifications.trim(),
        expertise: postJobForm.expertise,
        status: status,
        gymId: user?.gymId,
        branchId: user?.branchId
      };

      if (editingJobId) {
        await api.put(`/hiring/owner/jobs/${editingJobId}`, payload);
        Alert.alert('Success', 'Job vacancy updated successfully!');
      } else {
        await api.post('/hiring/owner/jobs', payload).catch(() => api.post('/hiring/jobs', payload));
        Alert.alert('Success', status === 'Draft' ? 'Job saved as draft!' : 'Job vacancy published successfully!');
      }

      resetPostJobForm();
      setHiringSubTab('jobs');
      fetchData();
    } catch (err: any) {
      Alert.alert('Post Failed', err.response?.data?.message || 'Failed to save job vacancy.');
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
            {/* SUB-TABS: Trainers List | Trainer Fees | Trainer Payments | Payment History (2x2 Grid so none clip) */}
            <View style={styles.subTabsGrid}>
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
                    style={[styles.subTabGridPill, isActive && styles.subTabPillActive]}
                    onPress={() => setTrainerSubTab(tab.key as any)}
                    activeOpacity={0.7}
                  >
                    <Ionicons 
                      name={tab.icon as any} 
                      size={14} 
                      color={isActive ? COLORS.white : COLORS.textMuted} 
                    />
                    <Text style={[styles.subTabPillText, isActive && styles.subTabPillTextActive]} numberOfLines={1}>
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* WEB-MATCHING PAGE HEADER */}
            <View style={styles.pageHeaderRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.pageHeaderTitle}>
                  {trainerSubTab === 'list' ? 'Trainers' :
                   trainerSubTab === 'fees' ? 'Trainer Fee Settings' :
                   trainerSubTab === 'payments' ? 'Trainer Payments' : 'Trainer Payment History'}
                </Text>
                <Text style={styles.pageHeaderSub}>
                  {trainerSubTab === 'list' ? 'Manage all trainers hired by your gym.' :
                   trainerSubTab === 'fees' ? 'Configure and manage fees for your trainers' :
                   trainerSubTab === 'payments' ? 'Log new payments and process pending trainer dues.' : 'Complete record of all trainer payments'}
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
              {trainerSubTab === 'fees' && (
                <TouchableOpacity 
                  style={styles.hireBtn}
                  onPress={openAddNewFeeModal}
                  activeOpacity={0.7}
                >
                  <Ionicons name="add" size={16} color={COLORS.white} />
                  <Text style={styles.hireBtnText}>Set New Fee</Text>
                </TouchableOpacity>
              )}
              {trainerSubTab === 'history' && (
                <View style={styles.totalPaidOutCard}>
                  <Text style={styles.totalPaidOutLabel}>Total Paid Out</Text>
                  <Text style={styles.totalPaidOutValue}>₹{totalPaidOut.toLocaleString('en-IN')}</Text>
                </View>
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
                  {filteredTrainers.length === 0 && invitations.length === 0 ? (
                    <View style={styles.emptyCardBox}>
                      <Ionicons name="barbell-outline" size={36} color={COLORS.textMuted} />
                      <Text style={styles.emptyCardTitle}>No Trainers Found</Text>
                      <Text style={styles.emptyCardText}>
                        {searchQuery || statusFilter !== 'All' 
                          ? 'No trainers match your selected filters. Try resetting search.' 
                          : 'No trainers found. Hire a trainer to get started.'}
                      </Text>
                    </View>
                  ) : (
                    <>
                      {filteredTrainers.map((t) => {
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
                      })}

                      {/* Pending Invitations (Matching Web) */}
                      {statusFilter === 'All' && invitations.map((invite: any) => (
                        <View key={invite._id} style={[styles.trainerCard, { opacity: 0.78, backgroundColor: '#FFFBF7' }]}>
                          <View style={styles.cardHeader}>
                            <View style={styles.avatar}>
                              <Text style={styles.avatarText}>{invite.trainerName?.charAt(0)?.toUpperCase() || 'I'}</Text>
                            </View>
                            <View style={styles.cardHeaderInfo}>
                              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                <Text style={styles.trainerNameText}>{invite.trainerName}</Text>
                                <View style={styles.modePill}>
                                  <Text style={styles.modePillText}>Invited</Text>
                                </View>
                              </View>
                              <Text style={styles.trainerEmailText}>{invite.email}</Text>
                            </View>
                            <View style={[styles.statusBadge, styles.statusBadgePending]}>
                              <Text style={[styles.statusBadgeText, styles.statusBadgeTextPending]}>
                                Invite {invite.status || 'Pending'}
                              </Text>
                            </View>
                          </View>
                          <View style={styles.cardDetailsBox}>
                            <View style={styles.detailItem}>
                              <Text style={styles.detailLabel}>SPECIALIZATION</Text>
                              <Text style={styles.detailValue}>{invite.specialization || '-'}</Text>
                            </View>
                            <View style={styles.detailItem}>
                              <Text style={styles.detailLabel}>MODE</Text>
                              <Text style={styles.detailValue}>{invite.trainingMode || 'offline'}</Text>
                            </View>
                            <View style={styles.detailItem}>
                              <Text style={styles.detailLabel}>FEE</Text>
                              <Text style={styles.feeNotConfigured}>—</Text>
                            </View>
                          </View>
                        </View>
                      ))}
                    </>
                  )}
                </View>
              </>
            )}

            {/* SUB-TAB 2: TRAINER FEES (WEB PARITY: KPI CARDS, SEARCH, FULL TABLE DETAILS) */}
            {trainerSubTab === 'fees' && (
              <>
                {/* 3 Summary KPI Cards */}
                <View style={styles.threeKpiRow}>
                  <View style={styles.threeKpiCard}>
                    <View style={[styles.smallKpiIcon, { backgroundColor: '#FFF7ED' }]}>
                      <Text style={{ color: COLORS.primary, fontWeight: '800', fontSize: 13 }}>₹</Text>
                    </View>
                    <Text style={styles.threeKpiValue}>{allFeeRows.length}</Text>
                    <Text style={styles.threeKpiLabel}>Total Trainers</Text>
                  </View>
                  <View style={styles.threeKpiCard}>
                    <View style={[styles.smallKpiIcon, { backgroundColor: '#ECFDF5' }]}>
                      <Ionicons name="checkmark-circle-outline" size={14} color="#EA580C" />
                    </View>
                    <Text style={styles.threeKpiValue}>{configuredFeeCount}</Text>
                    <Text style={styles.threeKpiLabel}>Fee Configured</Text>
                  </View>
                  <View style={styles.threeKpiCard}>
                    <View style={[styles.smallKpiIcon, { backgroundColor: '#FEF3C7' }]}>
                      <Ionicons name="alert-circle-outline" size={14} color="#D97706" />
                    </View>
                    <Text style={styles.threeKpiValue}>{pendingFeeCount}</Text>
                    <Text style={styles.threeKpiLabel}>Pending Setup</Text>
                  </View>
                </View>

                {/* Search trainer... */}
                <View style={styles.searchBar}>
                  <Ionicons name="search-outline" size={16} color={COLORS.textMuted} />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search trainer..."
                    placeholderTextColor={COLORS.textMuted}
                    value={feeSearchQuery}
                    onChangeText={setFeeSearchQuery}
                  />
                  {feeSearchQuery ? (
                    <TouchableOpacity onPress={() => setFeeSearchQuery('')}>
                      <Ionicons name="close-circle" size={16} color={COLORS.textMuted} />
                    </TouchableOpacity>
                  ) : null}
                </View>

                <View style={styles.trainersList}>
                  {filteredFeeRows.length === 0 ? (
                    <View style={styles.emptyCardBox}>
                      <Ionicons name="cash-outline" size={36} color={COLORS.textMuted} />
                      <Text style={styles.emptyCardTitle}>No trainers found</Text>
                      <Text style={styles.emptyCardText}>Add trainers to your gym first, then configure fees here.</Text>
                    </View>
                  ) : (
                    filteredFeeRows.map(({ trainer, fee }) => {
                      const feeStatus = fee?.status;
                      return (
                        <View key={trainer._id} style={styles.trainerCard}>
                          <View style={styles.cardHeader}>
                            <View style={styles.avatar}>
                              <Text style={styles.avatarText}>{trainer.name?.charAt(0)?.toUpperCase() || 'T'}</Text>
                            </View>
                            <View style={styles.cardHeaderInfo}>
                              <Text style={styles.trainerNameText}>{trainer.name}</Text>
                              <Text style={styles.trainerEmailText}>{trainer.email || trainer.specialization || 'Coaching Staff'}</Text>
                            </View>
                            {fee ? (
                              <View style={[
                                styles.statusBadge,
                                feeStatus === 'Active' ? styles.statusBadgeActive :
                                feeStatus === 'Pending' ? styles.statusBadgePending :
                                feeStatus === 'Rejected' ? styles.statusBadgeSuspended : styles.statusBadgeRejected
                              ]}>
                                <Text style={[
                                  styles.statusBadgeText,
                                  feeStatus === 'Active' ? styles.statusBadgeTextActive :
                                  feeStatus === 'Pending' ? styles.statusBadgeTextPending :
                                  feeStatus === 'Rejected' ? styles.statusBadgeTextSuspended : styles.statusBadgeTextRejected
                                ]}>
                                  {feeStatus || 'Active'}
                                </Text>
                              </View>
                            ) : (
                              <View style={[styles.statusBadge, styles.statusBadgePending]}>
                                <Text style={[styles.statusBadgeText, styles.statusBadgeTextPending]}>Not Set</Text>
                              </View>
                            )}
                          </View>

                          <View style={styles.feeDetailsGrid}>
                            <View style={styles.feeGridCell}>
                              <Text style={styles.detailLabel}>TRAINING TYPE</Text>
                              <Text style={styles.detailValue}>{fee ? fee.trainingType : 'Not set'}</Text>
                            </View>
                            <View style={styles.feeGridCell}>
                              <Text style={styles.detailLabel}>FEE (SALARY)</Text>
                              <Text style={styles.feeValue}>
                                {fee ? `₹${Number(fee.feeAmount).toLocaleString('en-IN')}` : '—'}
                              </Text>
                            </View>
                            <View style={styles.feeGridCell}>
                              <Text style={styles.detailLabel}>BILLING CYCLE</Text>
                              {fee ? (
                                <View style={styles.modePill}>
                                  <Text style={styles.modePillText}>{fee.billingCycle}</Text>
                                </View>
                              ) : (
                                <Text style={styles.detailValue}>—</Text>
                              )}
                            </View>
                            <View style={styles.feeGridCell}>
                              <Text style={styles.detailLabel}>EFFECTIVE FROM</Text>
                              <Text style={styles.detailValue}>
                                {fee?.effectiveFrom ? formatEffectiveDate(fee.effectiveFrom) : '—'}
                              </Text>
                            </View>
                          </View>

                          {fee ? (
                            <TouchableOpacity 
                              style={styles.editFeeBtnWide}
                              onPress={() => openEditFeeModal(fee, trainer)}
                              activeOpacity={0.75}
                            >
                              <Ionicons name="create-outline" size={15} color={COLORS.primary} />
                              <Text style={styles.editFeeBtnWideText}>Edit Fee</Text>
                            </TouchableOpacity>
                          ) : (
                            <TouchableOpacity 
                              style={styles.payNowBtn}
                              onPress={() => openSetFeeModal(trainer)}
                              activeOpacity={0.75}
                            >
                              <Ionicons name="add" size={15} color={COLORS.white} />
                              <Text style={styles.payNowBtnText}>Set Fee</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      );
                    })
                  )}
                </View>
              </>
            )}

            {/* SUB-TAB 3: TRAINER PAYMENTS (WEB PARITY: ACTIVE FEES ONLY + PROCESS PAYMENT MODAL) */}
            {trainerSubTab === 'payments' && (
              <>
                <View style={styles.searchBar}>
                  <Ionicons name="search-outline" size={16} color={COLORS.textMuted} />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search trainers by name..."
                    placeholderTextColor={COLORS.textMuted}
                    value={paymentSearchQuery}
                    onChangeText={setPaymentSearchQuery}
                  />
                  {paymentSearchQuery ? (
                    <TouchableOpacity onPress={() => setPaymentSearchQuery('')}>
                      <Ionicons name="close-circle" size={16} color={COLORS.textMuted} />
                    </TouchableOpacity>
                  ) : null}
                </View>

                <View style={styles.trainersList}>
                  {activePaymentFees.length === 0 ? (
                    <View style={styles.emptyCardBox}>
                      <Ionicons name="card-outline" size={36} color={COLORS.textMuted} />
                      <Text style={styles.emptyCardTitle}>No active fees found</Text>
                      <Text style={styles.emptyCardText}>No active fees found. Configure fees first.</Text>
                      <TouchableOpacity
                        style={[styles.hireBtn, { marginTop: 8 }]}
                        onPress={() => setTrainerSubTab('fees')}
                      >
                        <Text style={styles.hireBtnText}>Go to Trainer Fees</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    activePaymentFees.map((fee: any) => {
                      const tr = fee.trainerId || {};
                      return (
                        <View key={fee._id} style={styles.trainerCard}>
                          <View style={styles.cardHeader}>
                            <View style={styles.avatar}>
                              <Text style={styles.avatarText}>{tr.name?.charAt(0)?.toUpperCase() || 'T'}</Text>
                            </View>
                            <View style={styles.cardHeaderInfo}>
                              <Text style={styles.trainerNameText}>{tr.name || 'Trainer'}</Text>
                              <Text style={styles.trainerEmailText}>{tr.email || ''}</Text>
                            </View>
                          </View>

                          <View style={styles.cardDetailsBox}>
                            <View style={styles.detailItem}>
                              <Text style={styles.detailLabel}>TRAINING TYPE</Text>
                              <Text style={styles.detailValue}>{fee.trainingType || 'Offline Training'}</Text>
                            </View>
                            <View style={styles.detailItem}>
                              <Text style={styles.detailLabel}>FEE AMOUNT</Text>
                              <Text style={styles.feeValue}>
                                ₹ {Number(fee.feeAmount || 0).toLocaleString('en-IN')}
                                <Text style={styles.feeCycle}> / {fee.billingCycle || 'Monthly'}</Text>
                              </Text>
                            </View>
                          </View>

                          <TouchableOpacity 
                            style={styles.payNowBtn}
                            onPress={() => openProcessPaymentModal(fee)}
                            activeOpacity={0.75}
                          >
                            <Ionicons name="card-outline" size={15} color={COLORS.white} />
                            <Text style={styles.payNowBtnText}>Process Payment</Text>
                          </TouchableOpacity>
                        </View>
                      );
                    })
                  )}
                </View>
              </>
            )}

            {/* SUB-TAB 4: PAYMENT HISTORY (WEB PARITY: TOTAL PAID OUT, FILTERS, PDF EXPORT, DETAILS MODAL) */}
            {trainerSubTab === 'history' && (
              <>
                <View style={styles.searchBar}>
                  <Ionicons name="search-outline" size={16} color={COLORS.textMuted} />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search trainer..."
                    placeholderTextColor={COLORS.textMuted}
                    value={historySearchQuery}
                    onChangeText={setHistorySearchQuery}
                  />
                  {historySearchQuery ? (
                    <TouchableOpacity onPress={() => setHistorySearchQuery('')}>
                      <Ionicons name="close-circle" size={16} color={COLORS.textMuted} />
                    </TouchableOpacity>
                  ) : null}
                </View>

                {/* Status Filter Row */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
                  {(['All', 'Paid', 'Pending', 'Failed', 'Cancelled'] as const).map((st) => {
                    const isSelected = historyStatusFilter === st;
                    return (
                      <TouchableOpacity
                        key={st}
                        style={[styles.filterChip, isSelected && styles.filterChipActive]}
                        onPress={() => setHistoryStatusFilter(st)}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.filterChipText, isSelected && styles.filterChipTextActive]}>
                          {st === 'All' ? 'All Status' : st}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                {/* Method Filter & Download PDF Row */}
                <View style={styles.historyToolbarRow}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }}>
                    {(['All', 'Bank Transfer', 'UPI', 'Cash'] as const).map((m) => {
                      const isSelected = historyMethodFilter === m;
                      return (
                        <TouchableOpacity
                          key={m}
                          style={[styles.filterChip, isSelected && styles.filterChipActive]}
                          onPress={() => setHistoryMethodFilter(m)}
                          activeOpacity={0.7}
                        >
                          <Text style={[styles.filterChipText, isSelected && styles.filterChipTextActive]}>
                            {m === 'All' ? 'All Methods' : m}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>

                  <TouchableOpacity
                    style={[styles.hireBtn, filteredPaymentHistory.length === 0 && { opacity: 0.45 }]}
                    onPress={handleDownloadAllPaymentHistoryPDF}
                    disabled={filteredPaymentHistory.length === 0}
                    activeOpacity={0.75}
                  >
                    <Ionicons name="download-outline" size={15} color={COLORS.white} />
                    <Text style={styles.hireBtnText}>Download PDF</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.trainersList}>
                  {filteredPaymentHistory.length === 0 ? (
                    <View style={styles.emptyCardBox}>
                      <Ionicons name="time-outline" size={36} color={COLORS.textMuted} />
                      <Text style={styles.emptyCardTitle}>No payment records yet</Text>
                      <Text style={styles.emptyCardText}>
                        Payment records appear here after you process trainer payments. Start by configuring trainer fees.
                      </Text>
                      <TouchableOpacity
                        style={[styles.hireBtn, { marginTop: 8 }]}
                        onPress={() => setTrainerSubTab('fees')}
                      >
                        <Text style={styles.hireBtnText}>Configure Trainer Fees</Text>
                        <Ionicons name="arrow-forward" size={14} color={COLORS.white} />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    filteredPaymentHistory.map((p: any) => {
                      const status = p.paymentStatus || 'Paid';
                      const isPaid = status === 'Paid';
                      const isPending = status === 'Pending';
                      const isFailed = status === 'Failed';
                      return (
                        <View key={p._id} style={styles.trainerCard}>
                          <View style={styles.cardHeader}>
                            <View style={styles.avatar}>
                              <Text style={styles.avatarText}>{p.trainerId?.name?.charAt(0)?.toUpperCase() || 'T'}</Text>
                            </View>
                            <View style={styles.cardHeaderInfo}>
                              <Text style={styles.trainerNameText}>{p.trainerId?.name || 'Unknown'}</Text>
                              <Text style={styles.trainerEmailText}>{formatPaymentDateTime(p.createdAt || p.paymentDate)}</Text>
                            </View>
                            <View style={{ alignItems: 'flex-end', gap: 4 }}>
                              <Text style={styles.historyAmountText}>₹{Number(p.amount || 0).toLocaleString('en-IN')}</Text>
                              <View style={[
                                styles.statusBadge,
                                isPaid ? styles.statusBadgeActive :
                                isPending ? styles.statusBadgePending :
                                isFailed ? styles.statusBadgeSuspended : styles.statusBadgeRejected
                              ]}>
                                <Text style={[
                                  styles.statusBadgeText,
                                  isPaid ? styles.statusBadgeTextActive :
                                  isPending ? styles.statusBadgeTextPending :
                                  isFailed ? styles.statusBadgeTextSuspended : styles.statusBadgeTextRejected
                                ]}>
                                  {status}
                                </Text>
                              </View>
                            </View>
                          </View>

                          <View style={styles.cardDetailsBox}>
                            <View style={styles.detailItem}>
                              <Text style={styles.detailLabel}>TRAINING TYPE</Text>
                              <Text style={styles.detailValue}>{p.trainerFeeId?.trainingType || '-'}</Text>
                            </View>
                            <View style={styles.detailItem}>
                              <Text style={styles.detailLabel}>PAYMENT METHOD</Text>
                              <Text style={styles.detailValue}>{p.paymentMethod || '-'}</Text>
                            </View>
                            <TouchableOpacity
                              style={styles.viewDetailsLinkBtn}
                              onPress={() => setSelectedPaymentDetail(p)}
                              activeOpacity={0.7}
                            >
                              <Text style={styles.viewDetailsLinkText}>View Details</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      );
                    })
                  )}
                </View>
              </>
            )}
          </>
        ) : (
          /* =======================================================
             TRAINER HIRING SECTION (MATCHING WEB ADMIN HIRING)
             ======================================================= */
          <>
            {/* SUB-TABS: Manage Jobs | + Post a Job | Applications | Hired */}
            <View style={styles.subTabsWrapGrid}>
              {[
                { key: 'jobs', label: `Manage Jobs (${jobs.length})`, icon: 'briefcase' },
                { key: 'post', label: editingJobId ? 'Edit Job' : '+ Post a Job', icon: editingJobId ? 'create' : 'add-circle' },
                { key: 'applications', label: `Applications (${applications.length})`, icon: 'people' },
                { key: 'hired', label: `Hired (${hiredTrainers.length})`, icon: 'ribbon' },
              ].map((tab) => {
                const isActive = hiringSubTab === tab.key;
                return (
                  <TouchableOpacity
                    key={tab.key}
                    style={[styles.subTabPill, isActive && styles.subTabPillActive]}
                    onPress={() => {
                      if (tab.key === 'post' && hiringSubTab !== 'post') {
                        resetPostJobForm();
                      }
                      setHiringSubTab(tab.key as any);
                    }}
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
            </View>

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
                      const deadlinePassed = isDeadlineExpired(job.deadline);
                      const isClosed = job.status === 'Closed' || deadlinePassed;
                      const isPublished = job.status === 'Published' && !isClosed;
                      const salaryDisplay = job.salaryMin && job.salaryMax
                        ? `₹${Number(job.salaryMin).toLocaleString('en-IN')} - ₹${Number(job.salaryMax).toLocaleString('en-IN')} / ${job.salaryType || 'Monthly'}`
                        : (job.salaryMin ? `From ₹${Number(job.salaryMin).toLocaleString('en-IN')} / ${job.salaryType || 'Monthly'}` : 'Competitive / Negotiable');
                      const expDisplay = job.experience ? `Experience: ${job.experience}` : 'Experience: 1-2 Years';
                      const deadlineDisplay = job.deadline 
                        ? `Deadline: ${new Date(job.deadline).toLocaleDateString()}${deadlinePassed ? ' (Job Vacancy Over)' : ''}`
                        : 'Deadline: Ongoing';

                      return (
                        <View key={job._id || job.id} style={styles.jobCard}>
                          {/* Top Tag Row (Matching Web GymAdminManageJobs.tsx) */}
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
                                {deadlinePassed ? 'Job Vacancy Over' : isClosed ? 'Closed' : isPublished ? 'Active Published' : 'Draft'}
                              </Text>
                            </View>

                            <View style={styles.jobEmploymentPill}>
                              <Ionicons name="time-outline" size={12} color="#64748B" />
                              <Text style={styles.jobEmploymentText}>{job.employmentType || 'Full-time'}</Text>
                            </View>

                            {job.trainingMode && (
                              <View style={styles.jobEmploymentPill}>
                                <Text style={styles.jobEmploymentText}>{job.trainingMode}</Text>
                              </View>
                            )}

                            <View style={styles.jobLocationPill}>
                              <Ionicons name="location-sharp" size={12} color="#EA580C" />
                              <Text style={styles.jobLocationText} numberOfLines={1}>{job.location || 'Main Arena'}</Text>
                            </View>

                            {(job.vacanciesCount || 1) > 1 && (
                              <View style={styles.vacanciesCountPill}>
                                <Text style={styles.vacanciesCountPillText}>{job.vacanciesCount} Openings</Text>
                              </View>
                            )}
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
                                  setEditingJobId(job._id || job.id || null);
                                  setCustomExpertiseInput('');
                                  setPostJobForm({
                                    title: job.title || '',
                                    gymName: gymData?.name || user?.gymName || 'Your Gym',
                                    employmentType: job.employmentType || 'Full-time',
                                    trainingMode: (job.trainingMode as any) || 'Offline',
                                    experience: job.experience || '1-2 Years',
                                    vacanciesCount: String(job.vacanciesCount || 1),
                                    salaryMin: job.salaryMin ? String(job.salaryMin) : '',
                                    salaryMax: job.salaryMax ? String(job.salaryMax) : '',
                                    salaryType: job.salaryType || 'Monthly',
                                    isSalaryNegotiable: Boolean(job.isSalaryNegotiable),
                                    location: job.location || getDefaultGymLocation(),
                                    workingHours: job.workingHours || '',
                                    deadline: job.deadline ? new Date(job.deadline).toISOString().split('T')[0] : '',
                                    description: job.description || '',
                                    responsibilities: job.responsibilities || '',
                                    qualifications: job.qualifications || '',
                                    certifications: job.certifications || '',
                                    expertise: Array.isArray(job.expertise) ? job.expertise : []
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

            {/* SUB-VIEW 2: POST A JOB FORM (1:1 PARITY & ALIGNMENT WITH WEB GymAdminPostJob) */}
            {hiringSubTab === 'post' && (
              <View style={styles.postJobWrapper}>
                {/* Back to Manage Vacancies Bar */}
                <View style={styles.postBackHeaderRow}>
                  <TouchableOpacity 
                    style={styles.postBackBtn}
                    onPress={() => {
                      resetPostJobForm();
                      setHiringSubTab('jobs');
                    }}
                  >
                    <Ionicons name="arrow-back" size={16} color="#0F172A" />
                    <Text style={styles.postBackBtnText}>Back to Manage Vacancies</Text>
                  </TouchableOpacity>
                  <Text style={styles.postGymTagText} numberOfLines={1}>
                    Gym: <Text style={{ fontWeight: '700', color: '#0F172A' }}>{postJobForm.gymName}</Text>
                  </Text>
                </View>

                <View style={styles.postJobCard}>
                  {/* Card Title Header */}
                  <View style={styles.postFormHeaderRow}>
                    <View style={styles.postFormIconBox}>
                      <Ionicons name="briefcase" size={20} color={COLORS.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.postFormTitle}>
                        {editingJobId ? 'Edit Trainer Vacancy' : 'Post a Trainer Job Vacancy'}
                      </Text>
                      <Text style={styles.postFormSub}>
                        Fill in the job details, qualifications, and salary expectations to attract certified coaches.
                      </Text>
                    </View>
                  </View>

                  {/* 1. Job Title */}
                  <Text style={styles.inputLabel}>Job Title <Text style={styles.requiredStar}>*</Text></Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="e.g. Senior Strength & Conditioning Coach"
                    placeholderTextColor={COLORS.textMuted}
                    value={postJobForm.title}
                    onChangeText={(v) => setPostJobForm({ ...postJobForm, title: v })}
                  />

                  {/* 2. Gym / Facility Name */}
                  <Text style={styles.inputLabel}>Gym / Facility Name</Text>
                  <View style={styles.verifiedGymBox}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1, marginRight: 8 }}>
                      <Ionicons name="business" size={16} color={COLORS.primary} />
                      <Text style={styles.verifiedGymNameText} numberOfLines={1}>{postJobForm.gymName}</Text>
                    </View>
                    <View style={styles.verifiedGymBadge}>
                      <Ionicons name="checkmark-circle" size={12} color="#059669" />
                      <Text style={styles.verifiedGymBadgeText}>Verified Gym</Text>
                    </View>
                  </View>

                  {/* 3. Employment Type */}
                  <Text style={styles.inputLabel}>Employment Type <Text style={styles.requiredStar}>*</Text></Text>
                  <View style={styles.threeChipRow}>
                    {['Full-time', 'Part-time', 'Contract'].map((t) => {
                      const active = postJobForm.employmentType === t;
                      return (
                        <TouchableOpacity
                          key={t}
                          style={[styles.equalChoiceChip, active && styles.equalChoiceChipActive]}
                          onPress={() => setPostJobForm({ ...postJobForm, employmentType: t })}
                        >
                          <Text style={[styles.equalChoiceChipText, active && styles.equalChoiceChipTextActive]}>
                            {t}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {/* 4. Required Experience */}
                  <Text style={styles.inputLabel}>Required Experience <Text style={styles.requiredStar}>*</Text></Text>
                  <View style={styles.wrapChoiceGrid}>
                    {[
                      'Fresher / Entry Level',
                      '1-2 Years',
                      '3-5 Years',
                      '5-8 Years',
                      '8+ Years (Master Trainer)',
                    ].map((exp) => {
                      const active = postJobForm.experience === exp;
                      return (
                        <TouchableOpacity
                          key={exp}
                          style={[styles.wrapChoiceChip, active && styles.wrapChoiceChipActive]}
                          onPress={() => setPostJobForm({ ...postJobForm, experience: exp })}
                        >
                          <Text style={[styles.wrapChoiceChipText, active && styles.wrapChoiceChipTextActive]}>
                            {exp}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {/* 5. Number of Vacancies */}
                  <Text style={styles.inputLabel}>Number of Vacancies <Text style={styles.requiredStar}>*</Text></Text>
                  <View style={styles.vacancyRow}>
                    <TextInput
                      style={[styles.modalInput, { flex: 1 }]}
                      placeholder="1"
                      placeholderTextColor={COLORS.textMuted}
                      value={postJobForm.vacanciesCount}
                      onChangeText={(v) => setPostJobForm({ ...postJobForm, vacanciesCount: v.replace(/\D/g, '') })}
                      keyboardType="numeric"
                    />
                    <Text style={styles.vacancyHintPill}>1 – 50 Positions</Text>
                  </View>

                  {/* 6. Coaching Domains & Expertise (All 14 Web Tags + Custom Input) */}
                  <View style={{ marginTop: 8 }}>
                    <Text style={styles.inputLabel}>Coaching Domains & Expertise</Text>
                    <Text style={styles.fieldHintSub}>Select all specializations you are looking for in this trainer.</Text>
                    <View style={styles.skillsTagCloud}>
                      {[...COMMON_EXPERTISE, ...postJobForm.expertise.filter((s) => !COMMON_EXPERTISE.includes(s))].map((skill) => {
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
                    <View style={styles.customSkillRow}>
                      <TextInput
                        style={[styles.modalInput, { flex: 1 }]}
                        placeholder="Type other custom skill and tap Add..."
                        placeholderTextColor={COLORS.textMuted}
                        value={customExpertiseInput}
                        onChangeText={setCustomExpertiseInput}
                        onSubmitEditing={handleAddCustomExpertise}
                        returnKeyType="done"
                      />
                      <TouchableOpacity style={styles.customSkillAddBtn} onPress={handleAddCustomExpertise}>
                        <Ionicons name="add" size={16} color={COLORS.white} />
                        <Text style={styles.customSkillAddBtnText}>Add</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* 7. Training Mode */}
                  <View style={{ marginTop: 10 }}>
                    <Text style={styles.inputLabel}>Training Mode <Text style={styles.requiredStar}>*</Text></Text>
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

                  {/* 8. Salary & Compensation Structure */}
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

                    <View style={styles.twoColRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.salaryFieldLabel}>Min Salary (₹)</Text>
                        <TextInput
                          style={styles.salaryInput}
                          placeholder="e.g. 25000"
                          placeholderTextColor={COLORS.textMuted}
                          value={postJobForm.salaryMin}
                          onChangeText={(v) => setPostJobForm({ ...postJobForm, salaryMin: v.replace(/\D/g, '') })}
                          keyboardType="numeric"
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.salaryFieldLabel}>Max Salary (₹)</Text>
                        <TextInput
                          style={styles.salaryInput}
                          placeholder="e.g. 45000"
                          placeholderTextColor={COLORS.textMuted}
                          value={postJobForm.salaryMax}
                          onChangeText={(v) => setPostJobForm({ ...postJobForm, salaryMax: v.replace(/\D/g, '') })}
                          keyboardType="numeric"
                        />
                      </View>
                    </View>

                    <Text style={styles.salaryFieldLabel}>Payment Frequency</Text>
                    <View style={styles.wrapChoiceGrid}>
                      {[
                        { value: 'Monthly', label: 'Per Month' },
                        { value: 'Hourly', label: 'Per Hour' },
                        { value: 'Per Session', label: 'Per Session' },
                        { value: 'Annual', label: 'Per Annum (CTC)' },
                      ].map((freq) => {
                        const active = postJobForm.salaryType === freq.value;
                        return (
                          <TouchableOpacity
                            key={freq.value}
                            style={[styles.freqChoiceChip, active && styles.wrapChoiceChipActive]}
                            onPress={() => setPostJobForm({ ...postJobForm, salaryType: freq.value })}
                          >
                            <Text style={[styles.wrapChoiceChipText, active && styles.wrapChoiceChipTextActive]}>
                              {freq.label}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>

                  {/* 9. Location, Working Hours & Application Deadline (Full-width aligned to prevent clipping) */}
                  <Text style={styles.inputLabel}>
                    <Ionicons name="location-outline" size={13} color={COLORS.primary} /> Location <Text style={styles.requiredStar}>*</Text>
                  </Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="e.g. Indiranagar, Bangalore"
                    placeholderTextColor={COLORS.textMuted}
                    value={postJobForm.location}
                    onChangeText={(v) => setPostJobForm({ ...postJobForm, location: v })}
                  />

                  <Text style={styles.inputLabel}>
                    <Ionicons name="time-outline" size={13} color={COLORS.primary} /> Working Hours / Shift
                  </Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="e.g. 6:00 AM - 2:00 PM or Flexible"
                    placeholderTextColor={COLORS.textMuted}
                    value={postJobForm.workingHours}
                    onChangeText={(v) => setPostJobForm({ ...postJobForm, workingHours: v })}
                  />

                  <Text style={styles.inputLabel}>
                    <Ionicons name="calendar-outline" size={13} color={COLORS.primary} /> Application Deadline
                  </Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="YYYY-MM-DD (e.g. 2026-11-30)"
                    placeholderTextColor={COLORS.textMuted}
                    value={postJobForm.deadline}
                    onChangeText={(v) => setPostJobForm({ ...postJobForm, deadline: v })}
                  />
                  {isDeadlineExpired(postJobForm.deadline) ? (
                    <Text style={styles.deadlineExpiredText}>
                      Deadline expired: This job vacancy will be shown as over.
                    </Text>
                  ) : (
                    <Text style={styles.deadlineHintText}>
                      Once this deadline is completed, the job vacancy will automatically be shown as over.
                    </Text>
                  )}

                  {/* 10. Job Description */}
                  <Text style={styles.inputLabel}>Job Description <Text style={styles.requiredStar}>*</Text></Text>
                  <TextInput
                    style={[styles.modalInput, { minHeight: 96, textAlignVertical: 'top' }]}
                    placeholder="Provide a compelling overview of this role, the gym environment, and what makes your fitness community unique..."
                    placeholderTextColor={COLORS.textMuted}
                    value={postJobForm.description}
                    onChangeText={(v) => setPostJobForm({ ...postJobForm, description: v })}
                    multiline
                  />

                  {/* 11. Key Responsibilities */}
                  <Text style={styles.inputLabel}>Key Responsibilities</Text>
                  <TextInput
                    style={[styles.modalInput, { minHeight: 84, textAlignVertical: 'top' }]}
                    placeholder={'• Conduct client fitness assessments and 1-on-1 personal training sessions.\n• Guide members on proper posture, breathing, and safe machine usage.\n• Design customized strength and cardio programs using Gymora AI tools.'}
                    placeholderTextColor={COLORS.textMuted}
                    value={postJobForm.responsibilities}
                    onChangeText={(v) => setPostJobForm({ ...postJobForm, responsibilities: v })}
                    multiline
                  />

                  {/* 12. Required Qualifications & Preferred Certifications */}
                  <Text style={styles.inputLabel}>Required Qualifications</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="e.g. Degree in Physical Education or Sports Science"
                    placeholderTextColor={COLORS.textMuted}
                    value={postJobForm.qualifications}
                    onChangeText={(v) => setPostJobForm({ ...postJobForm, qualifications: v })}
                  />

                  <Text style={styles.inputLabel}>Preferred Certifications</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="e.g. ACE, NASM, ISSA, CSCS, CPR / AED"
                    placeholderTextColor={COLORS.textMuted}
                    value={postJobForm.certifications}
                    onChangeText={(v) => setPostJobForm({ ...postJobForm, certifications: v })}
                  />

                  {/* 13. Cancel, Save as Draft & Publish / Update Action Buttons */}
                  <View style={styles.formActionStack}>
                    <View style={styles.formActionTopRow}>
                      <TouchableOpacity
                        style={styles.cancelFormBtn}
                        onPress={() => {
                          resetPostJobForm();
                          setHiringSubTab('jobs');
                        }}
                        disabled={publishingJob}
                      >
                        <Text style={styles.cancelFormBtnText}>Cancel</Text>
                      </TouchableOpacity>

                      <TouchableOpacity 
                        style={styles.saveDraftBtn}
                        onPress={() => handlePublishJob('Draft')}
                        disabled={publishingJob}
                      >
                        <Ionicons name="bookmark-outline" size={14} color={COLORS.primary} />
                        <Text style={styles.saveDraftBtnText}>Save as Draft</Text>
                      </TouchableOpacity>
                    </View>

                    <TouchableOpacity 
                      style={styles.publishBtnFull}
                      onPress={() => handlePublishJob('Published')}
                      disabled={publishingJob}
                    >
                      {publishingJob ? (
                        <ActivityIndicator size="small" color={COLORS.white} />
                      ) : (
                        <>
                          <Ionicons name="send" size={15} color={COLORS.white} />
                          <Text style={styles.publishBtnText}>
                            {editingJobId ? 'Save & Update Vacancy' : 'Publish Vacancy Live'}
                          </Text>
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
                    onChangeText={(v) => setManualForm({ ...manualForm, phone: sanitizeTenDigitPhone(v) })}
                    keyboardType="number-pad"
                    maxLength={10}
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

                  <Text style={styles.inputLabel}>Mobile Phone (Optional - 10 Digits)</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="e.g. 9876543210"
                    placeholderTextColor={COLORS.textMuted}
                    value={inviteForm.phone}
                    onChangeText={(v) => setInviteForm({ ...inviteForm, phone: sanitizeTenDigitPhone(v) })}
                    keyboardType="number-pad"
                    maxLength={10}
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
                  {selectedTrainer.expertise ? (
                    <View style={styles.profileDataRow}>
                      <Text style={styles.profileDataLabel}>Expertise</Text>
                      <Text style={styles.profileDataVal}>{selectedTrainer.expertise}</Text>
                    </View>
                  ) : null}
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
                  {selectedTrainer.availableSlot ? (
                    <View style={styles.profileDataRow}>
                      <Text style={styles.profileDataLabel}>Slot Capacity</Text>
                      <Text style={styles.profileDataVal}>{selectedTrainer.availableSlot}</Text>
                    </View>
                  ) : null}
                </View>

                {selectedTrainer.bio ? (
                  <View style={styles.profileSection}>
                    <Text style={styles.profileSectionTitle}>ABOUT</Text>
                    <Text style={{ fontSize: 12, color: '#334155', lineHeight: 17 }}>{selectedTrainer.bio}</Text>
                  </View>
                ) : null}
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

              <Text style={styles.inputLabel}>Mobile Phone * (10 Digits)</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. 9876543210"
                placeholderTextColor={COLORS.textMuted}
                value={editForm.phone}
                onChangeText={(v) => setEditForm({ ...editForm, phone: sanitizeTenDigitPhone(v) })}
                keyboardType="number-pad"
                maxLength={10}
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
          MODAL 4: SET / EDIT TRAINER FEE MODAL (WEB PARITY)
          ======================================================= */}
      <Modal visible={showFeeModal} transparent animationType="slide">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={[styles.modalCard, { paddingBottom: Math.max(insets.bottom, 20) }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>{editingFeeRecord ? 'Edit Trainer Fee' : 'Set Trainer Fee'}</Text>
                <Text style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 1 }}>
                  Configure fee details for the selected trainer
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowFeeModal(false)}>
                <Ionicons name="close" size={22} color={COLORS.textMedium} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 440 }} showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Trainer *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 6 }}>
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  {trainers.map(tr => {
                    const selected = String(feeForm.trainerId) === String(tr._id);
                    return (
                      <TouchableOpacity
                        key={tr._id}
                        style={[styles.typeChip, { flex: 0, paddingHorizontal: 12 }, selected && styles.typeChipActive]}
                        onPress={() => setFeeForm({ ...feeForm, trainerId: String(tr._id) })}
                      >
                        <Text style={[styles.typeChipText, selected && styles.typeChipTextActive]}>
                          {tr.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>

              <Text style={styles.inputLabel}>Training Type *</Text>
              <View style={styles.typeSelectorRow}>
                {TRAINING_TYPES.map((tt) => (
                  <TouchableOpacity
                    key={tt}
                    style={[styles.typeChip, feeForm.trainingType === tt && styles.typeChipActive]}
                    onPress={() => setFeeForm({ ...feeForm, trainingType: tt })}
                  >
                    <Text style={[styles.typeChipText, feeForm.trainingType === tt && styles.typeChipTextActive]} numberOfLines={1}>
                      {tt.replace(' Training', '')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.twoColRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Fee Amount (₹) *</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="e.g. 25000"
                    placeholderTextColor={COLORS.textMuted}
                    value={feeForm.feeAmount}
                    onChangeText={(v) => setFeeForm({ ...feeForm, feeAmount: v.replace(/[^0-9.]/g, '') })}
                    keyboardType="numeric"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Effective From *</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={COLORS.textMuted}
                    value={feeForm.effectiveFrom}
                    onChangeText={(v) => setFeeForm({ ...feeForm, effectiveFrom: v })}
                  />
                </View>
              </View>

              <Text style={styles.inputLabel}>Billing Cycle *</Text>
              <View style={styles.typeSelectorRow}>
                {BILLING_CYCLES.map((c) => (
                  <TouchableOpacity
                    key={c}
                    style={[styles.typeChip, feeForm.billingCycle === c && styles.typeChipActive]}
                    onPress={() => setFeeForm({ ...feeForm, billingCycle: c })}
                  >
                    <Text style={[styles.typeChipText, feeForm.billingCycle === c && styles.typeChipTextActive]}>
                      {c}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Status</Text>
              <View style={styles.typeSelectorRow}>
                {['Active', 'Inactive', 'Pending', 'Rejected'].map((st) => (
                  <TouchableOpacity
                    key={st}
                    style={[styles.typeChip, feeForm.status === st && styles.typeChipActive]}
                    onPress={() => setFeeForm({ ...feeForm, status: st })}
                  >
                    <Text style={[styles.typeChipText, feeForm.status === st && styles.typeChipTextActive]}>
                      {st}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Notes (Optional)</Text>
              <TextInput
                style={[styles.modalInput, { height: 70, textAlignVertical: 'top' }]}
                placeholder="Any additional notes..."
                placeholderTextColor={COLORS.textMuted}
                value={feeForm.notes}
                onChangeText={(v) => setFeeForm({ ...feeForm, notes: v })}
                multiline
              />
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.modalCancelBtn} 
                onPress={() => setShowFeeModal(false)}
                disabled={savingFee}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.modalSubmitBtn} 
                onPress={handleSaveFee}
                disabled={savingFee}
              >
                {savingFee ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : (
                  <Text style={styles.modalSubmitText}>Save Trainer Fee</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* =======================================================
          MODAL 6: PROCESS TRAINER PAYMENT MODAL (WEB PARITY)
          ======================================================= */}
      <Modal visible={showProcessPaymentModal} transparent animationType="slide">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={[styles.modalCard, { paddingBottom: Math.max(insets.bottom, 20) }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Process Trainer Payment</Text>
                <Text style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 1 }}>
                  Confirm and record fee disbursement to trainer
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowProcessPaymentModal(false)}>
                <Ionicons name="close" size={22} color={COLORS.textMedium} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 460 }} showsVerticalScrollIndicator={false}>
              {/* Trainer Summary Badge */}
              <View style={styles.paymentSummaryBox}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {selectedPaymentFee?.trainerId?.name?.charAt(0)?.toUpperCase() || 'T'}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.trainerNameText}>
                    {selectedPaymentFee?.trainerId?.name || 'Trainer'}
                  </Text>
                  <Text style={styles.trainerEmailText}>{selectedPaymentFee?.trainerId?.email || ''}</Text>
                  <View style={[styles.modePill, { marginTop: 4 }]}>
                    <Text style={styles.modePillText}>{selectedPaymentFee?.trainingType || 'Offline Training'}</Text>
                  </View>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ fontSize: 10, color: COLORS.textMuted, fontWeight: '700' }}>DUE AMOUNT</Text>
                  <Text style={{ fontSize: 16, fontWeight: '800', color: COLORS.primary }}>
                    ₹{Number(selectedPaymentFee?.feeAmount || 0).toLocaleString('en-IN')}
                  </Text>
                  <Text style={{ fontSize: 10, color: COLORS.textMuted }}>
                    / {selectedPaymentFee?.billingCycle || 'Monthly'}
                  </Text>
                </View>
              </View>

              <View style={styles.twoColRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Amount to Pay (₹) *</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={processPaymentForm.amount}
                    onChangeText={(v) => setProcessPaymentForm({ ...processPaymentForm, amount: v.replace(/[^0-9.]/g, '') })}
                    keyboardType="numeric"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Payment Date *</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="YYYY-MM-DD"
                    value={processPaymentForm.paymentDate}
                    onChangeText={(v) => setProcessPaymentForm({ ...processPaymentForm, paymentDate: v })}
                  />
                </View>
              </View>

              <Text style={styles.inputLabel}>Select Payment Method *</Text>
              <View style={styles.typeSelectorRow}>
                {[
                  { value: 'Bank Transfer', label: 'Bank Transfer' },
                  { value: 'UPI', label: 'UPI / QR' },
                  { value: 'Cash', label: 'Cash' }
                ].map((m) => (
                  <TouchableOpacity
                    key={m.value}
                    style={[styles.typeChip, processPaymentForm.paymentMethod === m.value && styles.typeChipActive]}
                    onPress={() => setProcessPaymentForm({ ...processPaymentForm, paymentMethod: m.value })}
                  >
                    <Text style={[styles.typeChipText, processPaymentForm.paymentMethod === m.value && styles.typeChipTextActive]}>
                      {m.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {processPaymentForm.paymentMethod === 'Bank Transfer' && (
                <View style={styles.paymentMethodBox}>
                  <Text style={styles.profileSectionTitle}>TRAINER BANK ACCOUNT DETAILS</Text>
                  <Text style={styles.inputLabel}>Account Holder Name</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={processPaymentForm.accountHolder}
                    onChangeText={(v) => setProcessPaymentForm({ ...processPaymentForm, accountHolder: v })}
                  />
                  <Text style={styles.inputLabel}>Bank Name</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="e.g. HDFC Bank, SBI, ICICI"
                    placeholderTextColor={COLORS.textMuted}
                    value={processPaymentForm.bankName}
                    onChangeText={(v) => setProcessPaymentForm({ ...processPaymentForm, bankName: v })}
                  />
                  <View style={styles.twoColRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.inputLabel}>Account Number</Text>
                      <TextInput
                        style={styles.modalInput}
                        placeholder="9-18 digits"
                        placeholderTextColor={COLORS.textMuted}
                        value={processPaymentForm.accountNumber}
                        onChangeText={(v) => setProcessPaymentForm({ ...processPaymentForm, accountNumber: v.replace(/\D/g, '').slice(0, 18) })}
                        keyboardType="numeric"
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.inputLabel}>IFSC Code</Text>
                      <TextInput
                        style={styles.modalInput}
                        placeholder="HDFC0001234"
                        placeholderTextColor={COLORS.textMuted}
                        value={processPaymentForm.ifscCode}
                        onChangeText={(v) => setProcessPaymentForm({ ...processPaymentForm, ifscCode: v.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 11) })}
                        autoCapitalize="characters"
                      />
                    </View>
                  </View>
                  <Text style={styles.inputLabel}>Bank UTR / Transaction Reference ID *</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="e.g. UTR202609298877"
                    placeholderTextColor={COLORS.textMuted}
                    value={processPaymentForm.transactionId}
                    onChangeText={(v) => setProcessPaymentForm({ ...processPaymentForm, transactionId: v.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 22) })}
                    autoCapitalize="characters"
                  />
                </View>
              )}

              {processPaymentForm.paymentMethod === 'UPI' && (
                <View style={styles.paymentMethodBox}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={styles.profileSectionTitle}>UPI PAYMENT</Text>
                    <TouchableOpacity
                      style={styles.configFeeBtn}
                      onPress={() => setShowQrCode(!showQrCode)}
                    >
                      <Ionicons name="qr-code-outline" size={14} color={COLORS.primary} />
                      <Text style={styles.configFeeBtnText}>{showQrCode ? 'Hide QR' : 'Scan UPI QR'}</Text>
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.inputLabel}>Quick Select UPI App</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 4 }}>
                    {UPI_APPS.map(app => (
                      <TouchableOpacity
                        key={app.name}
                        style={[styles.filterChip, processPaymentForm.upiApp === app.name && styles.filterChipActive]}
                        onPress={() => handleSelectUpiApp(app)}
                      >
                        <Text style={[styles.filterChipText, processPaymentForm.upiApp === app.name && styles.filterChipTextActive]}>
                          {app.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text style={styles.inputLabel}>Trainer UPI ID / VPA *</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="e.g. 9876543210@paytm"
                    placeholderTextColor={COLORS.textMuted}
                    value={processPaymentForm.upiId}
                    onChangeText={(v) => setProcessPaymentForm({ ...processPaymentForm, upiId: v.trim() })}
                    autoCapitalize="none"
                  />

                  {showQrCode && (
                    <View style={styles.qrPreviewBox}>
                      <Image
                        source={{
                          uri: `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                            `upi://pay?pa=${processPaymentForm.upiId || ''}&pn=${processPaymentForm.upiName || 'Trainer'}&am=${processPaymentForm.amount || '0'}&cu=INR&tn=Trainer%20Fee%20Payment`
                          )}`
                        }}
                        style={{ width: 140, height: 140, borderRadius: 8 }}
                      />
                      <Text style={{ fontSize: 11, color: '#334155', marginTop: 6, fontWeight: '600' }}>
                        UPI VPA: {processPaymentForm.upiId || 'Not set'}
                      </Text>
                    </View>
                  )}

                  <Text style={styles.inputLabel}>UPI Reference / Transaction ID (UTR) *</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="12-digit UTR number"
                    placeholderTextColor={COLORS.textMuted}
                    value={processPaymentForm.transactionId}
                    onChangeText={(v) => setProcessPaymentForm({ ...processPaymentForm, transactionId: v.replace(/[^0-9]/g, '').slice(0, 12) })}
                    keyboardType="numeric"
                    maxLength={12}
                  />
                </View>
              )}

              {processPaymentForm.paymentMethod === 'Cash' && (
                <View style={styles.paymentMethodBox}>
                  <Text style={styles.profileSectionTitle}>CASH PAYMENT SETTLEMENT</Text>
                  <Text style={styles.inputLabel}>Handed Over To *</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={processPaymentForm.handedOverTo}
                    onChangeText={(v) => setProcessPaymentForm({ ...processPaymentForm, handedOverTo: v })}
                  />
                  <Text style={styles.inputLabel}>Cash Receipt / Voucher No. (Optional)</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="e.g. CASH-OCT-2026"
                    placeholderTextColor={COLORS.textMuted}
                    value={processPaymentForm.transactionId}
                    onChangeText={(v) => setProcessPaymentForm({ ...processPaymentForm, transactionId: v })}
                  />
                </View>
              )}

              <Text style={styles.inputLabel}>Payment Notes / Remarks (Optional)</Text>
              <TextInput
                style={[styles.modalInput, { height: 64, textAlignVertical: 'top' }]}
                placeholder="e.g. Monthly trainer retainer fee"
                placeholderTextColor={COLORS.textMuted}
                value={processPaymentForm.notes}
                onChangeText={(v) => setProcessPaymentForm({ ...processPaymentForm, notes: v })}
                multiline
              />
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.modalCancelBtn} 
                onPress={() => setShowProcessPaymentModal(false)}
                disabled={savingPayment}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.modalSubmitBtn} 
                onPress={handleProcessPaymentSubmit}
                disabled={savingPayment}
              >
                {savingPayment ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : (
                  <Text style={styles.modalSubmitText}>Confirm & Submit Payment</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* =======================================================
          MODAL 7: PAYMENT DETAILS MODAL (WEB PARITY)
          ======================================================= */}
      <Modal visible={Boolean(selectedPaymentDetail)} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { paddingBottom: Math.max(insets.bottom, 20) }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Payment Details</Text>
              <TouchableOpacity onPress={() => setSelectedPaymentDetail(null)}>
                <Ionicons name="close" size={22} color={COLORS.textMedium} />
              </TouchableOpacity>
            </View>

            {selectedPaymentDetail && (
              <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator={false}>
                <View style={styles.paymentHighlightCard}>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: COLORS.primary }}>Amount Paid</Text>
                  <Text style={{ fontSize: 22, fontWeight: '800', color: COLORS.primary }}>
                    ₹{Number(selectedPaymentDetail.amount || 0).toLocaleString('en-IN')}
                  </Text>
                </View>

                <View style={styles.profileSection}>
                  <View style={styles.profileDataRow}>
                    <Text style={styles.profileDataLabel}>Trainer</Text>
                    <Text style={styles.profileDataVal}>{selectedPaymentDetail.trainerId?.name || 'Unknown'}</Text>
                  </View>
                  <View style={styles.profileDataRow}>
                    <Text style={styles.profileDataLabel}>Training Type</Text>
                    <Text style={styles.profileDataVal}>{selectedPaymentDetail.trainerFeeId?.trainingType || '-'}</Text>
                  </View>
                  <View style={styles.profileDataRow}>
                    <Text style={styles.profileDataLabel}>Status</Text>
                    <Text style={[styles.profileDataVal, { color: COLORS.primary }]}>
                      {selectedPaymentDetail.paymentStatus || '-'}
                    </Text>
                  </View>
                  <View style={styles.profileDataRow}>
                    <Text style={styles.profileDataLabel}>Date</Text>
                    <Text style={styles.profileDataVal}>
                      {formatPaymentDateTime(selectedPaymentDetail.paymentDate || selectedPaymentDetail.createdAt)}
                    </Text>
                  </View>
                  <View style={styles.profileDataRow}>
                    <Text style={styles.profileDataLabel}>Payment Method</Text>
                    <Text style={styles.profileDataVal}>{selectedPaymentDetail.paymentMethod || '-'}</Text>
                  </View>
                  <View style={styles.profileDataRow}>
                    <Text style={styles.profileDataLabel}>Transaction ID</Text>
                    <Text style={styles.profileDataVal}>{selectedPaymentDetail.transactionId || 'N/A'}</Text>
                  </View>
                </View>

                {selectedPaymentDetail.paymentProof ? (
                  <TouchableOpacity
                    style={[styles.editFeeBtnWide, { marginTop: 10 }]}
                    onPress={() => Linking.openURL(selectedPaymentDetail.paymentProof).catch(() => Alert.alert('Error', 'Unable to open proof link.'))}
                  >
                    <Ionicons name="document-text-outline" size={15} color={COLORS.primary} />
                    <Text style={styles.editFeeBtnWideText}>View Payment Proof</Text>
                  </TouchableOpacity>
                ) : null}

                {selectedPaymentDetail.notes ? (
                  <View style={styles.profileSection}>
                    <Text style={styles.profileSectionTitle}>NOTES</Text>
                    <Text style={{ fontSize: 12, color: '#334155', lineHeight: 17 }}>{selectedPaymentDetail.notes}</Text>
                  </View>
                ) : null}
              </ScrollView>
            )}

            <View style={[styles.modalActions, { gap: 10 }]}>
              <TouchableOpacity
                style={[styles.modalSubmitBtn, { flex: 1.4, flexDirection: 'row', gap: 6 }]}
                onPress={() => selectedPaymentDetail && handleDownloadSinglePaymentReceiptPDF(selectedPaymentDetail)}
              >
                <Ionicons name="download-outline" size={16} color={COLORS.white} />
                <Text style={styles.modalSubmitText}>Download PDF</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalCancelBtn, { flex: 0.8 }]}
                onPress={() => setSelectedPaymentDetail(null)}
              >
                <Text style={styles.modalCancelText}>Close</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
    borderRadius: 12,
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
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
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
  // Web-Parity Trainer Tabs, Fees, Payments & History Styles
  subTabsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  subTabGridPill: {
    width: (width - 40) / 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  totalPaidOutCard: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'flex-end',
  },
  totalPaidOutLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  totalPaidOutValue: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primary,
  },
  threeKpiRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  threeKpiCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 10,
    alignItems: 'flex-start',
    gap: 4,
  },
  smallKpiIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  threeKpiValue: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
  },
  threeKpiLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  feeDetailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    rowGap: 10,
    columnGap: 8,
  },
  feeGridCell: {
    width: '47%',
  },
  editFeeBtnWide: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 4,
  },
  editFeeBtnWideText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  historyToolbarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  historyAmountText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
  },
  viewDetailsLinkBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
  },
  viewDetailsLinkText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9A3412',
  },
  paymentSummaryBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 6,
  },
  paymentMethodBox: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
  },
  qrPreviewBox: {
    marginTop: 10,
    padding: 12,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#CBD5E1',
    borderRadius: 12,
    alignItems: 'center',
  },
  paymentHighlightCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    borderRadius: 12,
    padding: 14,
    marginBottom: 4,
  },
  subTabsWrapGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  vacanciesCountPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  vacanciesCountPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#EA580C',
  },
  requiredStar: {
    color: '#B91C1C',
  },
  threeChipRow: {
    flexDirection: 'row',
    gap: 8,
  },
  equalChoiceChip: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  equalChoiceChipActive: {
    backgroundColor: '#C2410C',
    borderColor: '#C2410C',
  },
  equalChoiceChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  equalChoiceChipTextActive: {
    color: '#FFFFFF',
  },
  wrapChoiceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  wrapChoiceChip: {
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  wrapChoiceChipActive: {
    backgroundColor: '#FFF7ED',
    borderColor: '#EA580C',
  },
  wrapChoiceChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  wrapChoiceChipTextActive: {
    color: '#EA580C',
    fontWeight: '700',
  },
  freqChoiceChip: {
    width: '48%',
    paddingHorizontal: 10,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vacancyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  vacancyHintPill: {
    paddingHorizontal: 10,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  customSkillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  customSkillAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#C2410C',
  },
  customSkillAddBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  salaryFieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 4,
    marginTop: 4,
  },
  salaryInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 12,
    color: '#111827',
    backgroundColor: '#FFFFFF',
  },
  deadlineExpiredText: {
    fontSize: 11,
    color: '#B91C1C',
    fontWeight: '700',
    marginTop: 4,
    marginBottom: 4,
  },
  formActionStack: {
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: 10,
  },
  formActionTopRow: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelFormBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cancelFormBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  publishBtnFull: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#C2410C',
    paddingVertical: 13,
    borderRadius: 12,
  },
});
