import React, { useState, useEffect, useRef } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Activity,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Eye,
  EyeOff,
  ArrowLeft,
  Lock,
  Briefcase,
  UserCheck,
  Building2,
  Sparkles,
  Award,
  Upload,
  FileText,
  Trash2,
  RefreshCw,
  MapPin,
  DollarSign,
  Calendar,
  Check,
  Camera,
  ShieldCheck
} from 'lucide-react';
import api from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';

const SPECIALIZATIONS = [
  'Personal Training',
  'Strength & Conditioning',
  'Weight Loss Coaching',
  'Muscle Gain',
  'Bodybuilding',
  'Yoga',
  'Zumba',
  'CrossFit',
  'Group Fitness',
  'General Fitness',
  'Nutrition Coaching',
  'Other'
];

const EXPERIENCE_OPTIONS = [
  'Fresher / Less than 1 Year',
  '1–2 Years',
  '3–5 Years',
  '6–10 Years',
  '10+ Years'
];

const AVAILABILITY_OPTIONS = [
  'Immediately',
  'Within 15 Days',
  'Within 30 Days',
  'More than 30 Days'
];

const TRAINING_MODES = [
  { value: 'On-Site / Gym Floor', label: 'On-Site / Gym Floor', icon: '🏋️', desc: 'In-person coaching at gym' },
  { value: 'Online / Remote', label: 'Online / Remote', icon: '💻', desc: 'Virtual remote sessions' },
  { value: 'Both (Hybrid)', label: 'Both (Hybrid)', icon: '🔄', desc: 'Mix of in-person & online' }
];

export default function TrainerRegisterPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const jobId = searchParams.get('jobId');
  const returnUrl = searchParams.get('returnUrl');

  const { user, isAuthenticated, login } = useAuth();
  const isLoggedInTrainer = Boolean(isAuthenticated && user?.role === 'TRAINER');

  // Job Details
  const [jobInfo, setJobInfo] = useState<{
    id: string;
    title: string;
    gymName: string;
    location: string;
    employmentType?: string;
  } | null>(null);
  const [loadingJob, setLoadingJob] = useState(Boolean(jobId));

  // Form State
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    city: '',
    profilePhoto: '',
    specialization: 'Strength & Conditioning',
    experience: '1–2 Years',
    trainingMode: 'Both (Hybrid)',
    certifications: '',
    qualifications: '',
    previousGym: '',
    expectedSalary: '',
    availability: 'Immediately',
    preferredLocation: '',
    resumeUrl: '',
    resumeOriginalName: '',
    certificationUrl: '',
    certificationOriginalName: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  });

  // UI States
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [successData, setSuccessData] = useState<{ message: string; applicationId?: string } | null>(null);

  // OTP Verification States
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpVerified, setOtpVerified] = useState(isLoggedInTrainer);
  const [otpMessage, setOtpMessage] = useState('');
  const [otpError, setOtpError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  // File Upload States
  const [uploadingResume, setUploadingResume] = useState(false);
  const [uploadingCert, setUploadingCert] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [resumeSizeText, setResumeSizeText] = useState('');
  const [certSizeText, setCertSizeText] = useState('');

  const resumeInputRef = useRef<HTMLInputElement>(null);
  const certInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Pre-fill profile if user is already logged in as a Trainer
  useEffect(() => {
    if (isLoggedInTrainer && user) {
      setOtpVerified(true);
      setForm((prev) => ({
        ...prev,
        firstName: user.firstName || prev.firstName,
        lastName: user.lastName || prev.lastName,
        email: user.email || prev.email,
        mobile: user.mobile || (user as any).phone || prev.mobile,
        preferredLocation: prev.preferredLocation || prev.city
      }));
    }
  }, [isLoggedInTrainer, user]);

  // Resend OTP countdown timer
  useEffect(() => {
    let interval: any;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((t) => t - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Generate / Send OTP
  const handleSendOtp = async (targetEmailParam?: string) => {
    const targetEmail = (targetEmailParam || form.email).trim().toLowerCase();
    if (!targetEmail) {
      setFieldErrors((prev) => ({ ...prev, email: 'Please enter your email address' }));
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(targetEmail)) {
      setFieldErrors((prev) => ({ ...prev, email: 'Please enter a valid email format' }));
      return;
    }

    setOtpSending(true);
    setOtpError('');
    setOtpMessage('');

    try {
      const res = await api.post('/auth/send-otp', { email: targetEmail });
      if (res.data?.success) {
        setOtpSent(true);
        setResendTimer(30);
        setOtpMessage(res.data.message || `Verification code sent to ${targetEmail}`);
        setFieldErrors((prev) => {
          const next = { ...prev };
          delete next.email;
          return next;
        });
      } else {
        setOtpError(res.data?.message || 'Failed to send OTP email');
      }
    } catch (err: any) {
      setOtpError(err.response?.data?.message || 'Failed to dispatch verification email');
    } finally {
      setOtpSending(false);
    }
  };

  // Verify OTP
  const handleVerifyOtp = async () => {
    if (!otp.trim() || otp.trim().length !== 6) {
      setOtpError('Please enter the 6-digit verification code');
      return;
    }

    setOtpVerifying(true);
    setOtpError('');
    try {
      const res = await api.post('/auth/verify-otp', {
        email: form.email.trim().toLowerCase(),
        otp: otp.trim()
      });

      if (res.data?.success) {
        setOtpVerified(true);
        setOtpMessage('Email address verified successfully!');
        setFieldErrors((prev) => {
          const next = { ...prev };
          delete next.email;
          return next;
        });
      } else {
        setOtpError(res.data?.message || 'Invalid or expired OTP code');
      }
    } catch (err: any) {
      setOtpError(err.response?.data?.message || 'Invalid or expired OTP. Please try again.');
    } finally {
      setOtpVerifying(false);
    }
  };

  // Fetch target job info if jobId query param is present
  useEffect(() => {
    if (!jobId) return;
    const fetchTargetJob = async () => {
      setLoadingJob(true);
      try {
        const res = await api.get(`/hiring/jobs/${jobId}`);
        if (res.data?.success && res.data.job) {
          const j = res.data.job;
          setJobInfo({
            id: j._id || jobId,
            title: j.title || 'Trainer Role',
            gymName: j.gymName || j.gymId?.name || 'Verified Gym Partner',
            location: j.location || j.gymId?.address || j.gymId?.city || 'On-site facility',
            employmentType: j.employmentType
          });
          // Set preferred work location default if empty
          if (!form.preferredLocation && (j.location || j.gymId?.city)) {
            setForm((prev) => ({
              ...prev,
              preferredLocation: prev.preferredLocation || j.location || j.gymId?.city || ''
            }));
          }
        }
      } catch (err) {
        console.error('Failed to load target job info:', err);
      } finally {
        setLoadingJob(false);
      }
    };
    fetchTargetJob();
  }, [jobId]);

  // Helper for file size format
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Upload Document Handler
  const handleFileUpload = async (
    file: File,
    type: 'resume' | 'cert' | 'photo'
  ) => {
    // Size check: Max 10MB
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      alert('File size exceeds the 10MB limit. Please upload a smaller file.');
      return;
    }

    // Type check
    if (type === 'resume') {
      const valid = /\.(pdf|doc|docx)$/i.test(file.name);
      if (!valid) {
        alert('Resume must be in PDF or Word document (.doc, .docx) format.');
        return;
      }
      setUploadingResume(true);
    } else if (type === 'cert') {
      const valid = /\.(pdf|jpg|jpeg|png)$/i.test(file.name);
      if (!valid) {
        alert('Certifications must be in PDF, JPG, or PNG format.');
        return;
      }
      setUploadingCert(true);
    } else if (type === 'photo') {
      const valid = /\.(jpg|jpeg|png|webp)$/i.test(file.name);
      if (!valid) {
        alert('Profile photo must be an image file (JPG, PNG, WEBP).');
        return;
      }
      setUploadingPhoto(true);
    }

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await api.post('/hiring/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data?.success && res.data.fileUrl) {
        if (type === 'resume') {
          setForm((prev) => ({
            ...prev,
            resumeUrl: res.data.fileUrl,
            resumeOriginalName: file.name
          }));
          setResumeSizeText(formatFileSize(file.size));
          setFieldErrors((prev) => {
            const next = { ...prev };
            delete next.resumeUrl;
            return next;
          });
        } else if (type === 'cert') {
          setForm((prev) => ({
            ...prev,
            certificationUrl: res.data.fileUrl,
            certificationOriginalName: file.name
          }));
          setCertSizeText(formatFileSize(file.size));
        } else if (type === 'photo') {
          setForm((prev) => ({
            ...prev,
            profilePhoto: res.data.fileUrl
          }));
        }
      } else {
        alert('Failed to upload file. Please try again.');
      }
    } catch (err: any) {
      console.error('File upload error:', err);
      alert(err.response?.data?.message || 'Error uploading file. Please try again.');
    } finally {
      if (type === 'resume') setUploadingResume(false);
      if (type === 'cert') setUploadingCert(false);
      if (type === 'photo') setUploadingPhoto(false);
    }
  };

  // Password strength calculator
  const calculatePasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: '', color: 'bg-transparent' };
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    switch (score) {
      case 1:
        return { score: 25, label: 'Weak', color: 'bg-amber-500' };
      case 2:
        return { score: 50, label: 'Fair', color: 'bg-amber-400' };
      case 3:
        return { score: 75, label: 'Good', color: 'bg-[#B76E79]' };
      case 4:
        return { score: 100, label: 'Strong', color: 'bg-[#9F5965]' };
      default:
        return { score: 15, label: 'Very Weak', color: 'bg-rose-500' };
    }
  };

  const pwdStrength = calculatePasswordStrength(form.password);

  // Form Validation
  const validate = () => {
    const errs: Record<string, string> = {};

    if (!form.firstName.trim()) errs.firstName = 'First name is required';
    if (!form.lastName.trim()) errs.lastName = 'Last name is required';

    if (!form.email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      errs.email = 'Please enter a valid email address';
    } else if (!isLoggedInTrainer && !otpVerified) {
      errs.email = 'Please verify your email address with the 6-digit OTP';
    }

    const cleanMobile = form.mobile.replace(/\D/g, '');
    if (!cleanMobile) {
      errs.mobile = 'Mobile number is required';
    } else if (cleanMobile.length !== 10) {
      errs.mobile = 'Mobile number must be exactly 10 digits';
    } else if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
      errs.mobile = 'Enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9';
    }

    if (!form.city.trim()) {
      errs.city = 'Current city / location is required';
    }

    if (!form.preferredLocation.trim()) {
      errs.preferredLocation = 'Preferred work location is required';
    }

    // Resume is required, especially for job applications
    if (!form.resumeUrl) {
      errs.resumeUrl = 'Please upload your Resume / CV (PDF or DOC/DOCX)';
    }

    // Password validation (only if not already logged in)
    if (!isLoggedInTrainer) {
      if (!form.password) {
        errs.password = 'Password is required';
      } else if (form.password.length < 8) {
        errs.password = 'Password must be at least 8 characters long';
      }

      if (form.password !== form.confirmPassword) {
        errs.confirmPassword = 'Passwords do not match';
      }

      if (!form.acceptTerms) {
        errs.acceptTerms = 'You must agree to the Terms of Service and Privacy Policy';
      }
    }

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Submit Handler
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validate()) {
      // Scroll to the first error
      window.scrollTo({ top: 150, behavior: 'smooth' });
      return;
    }

    setIsLoading(true);

    try {
      // SCENARIO A: Trainer is ALREADY logged in -> Apply directly to the job
      if (isLoggedInTrainer && jobId) {
        const appPayload = {
          name: `${form.firstName.trim()} ${form.lastName.trim()}`.trim(),
          email: form.email.trim().toLowerCase(),
          phone: form.mobile.trim(),
          profilePhoto: form.profilePhoto || undefined,
          qualifications: form.qualifications.trim() || undefined,
          certifications: form.certifications.trim() || undefined,
          workExperience: form.experience,
          expertise: [form.specialization],
          expectedSalary: form.expectedSalary.trim() || undefined,
          preferredLocation: form.preferredLocation.trim() || form.city.trim(),
          employmentPreference: jobInfo?.employmentType || 'Full-time',
          availability: form.availability,
          resumeUrl: form.resumeUrl,
          resumeOriginalName: form.resumeOriginalName
        };

        const res = await api.post(`/hiring/trainer/apply/${jobId}`, appPayload);
        if (res.data?.success) {
          setSuccessData({
            message: 'Application submitted successfully! Your application is now Pending Review.',
            applicationId: res.data.application?._id
          });
        } else {
          setError(res.data?.message || 'Failed to submit application');
        }
        return;
      }

      // SCENARIO B: New Trainer Registration (+ Auto-Apply if jobId present)
      const registerPayload = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim().toLowerCase(),
        mobile: form.mobile.trim(),
        password: form.password,
        city: form.city.trim(),
        profilePhoto: form.profilePhoto || undefined,
        specialization: form.specialization,
        experience: form.experience,
        trainingMode: form.trainingMode,
        certifications: form.certifications.trim() || undefined,
        qualifications: form.qualifications.trim() || undefined,
        previousGym: form.previousGym.trim() || undefined,
        expectedSalary: form.expectedSalary.trim() || undefined,
        availability: form.availability,
        preferredLocation: form.preferredLocation.trim() || form.city.trim(),
        resumeUrl: form.resumeUrl,
        resumeOriginalName: form.resumeOriginalName,
        certificationUrl: form.certificationUrl || undefined,
        jobId: jobId || undefined
      };

      const res = await api.post('/auth/register-trainer', registerPayload);

      if (res.data?.token && res.data?.user) {
        login(res.data.user, res.data.token, true);

        setSuccessData({
          message: jobId
            ? 'Account created and application submitted! Your application is now Pending Review with the gym.'
            : 'Welcome to Gymora! Your Trainer account has been registered successfully.'
        });
      }
    } catch (err: any) {
      console.error('Registration/Application error:', err);
      const msg = err.response?.data?.message || 'Failed to process registration. Please check your information.';
      setError(msg);
      window.scrollTo({ top: 100, behavior: 'smooth' });
    } finally {
      setIsLoading(false);
    }
  };

  // Success view
  if (successData) {
    return (
      <div className="min-h-screen bg-[#FFFFFF] text-[#292524] flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg bg-[#F3E8E8] border border-[#B76E79]/40 rounded-3xl p-8 sm:p-10 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-[#B76E79]/10 text-[#B76E79] flex items-center justify-center mx-auto border border-[#B76E79]/30 shadow-lg shadow-[#B76E79]/15">
            <CheckCircle2 size={36} strokeWidth={2.5} />
          </div>

          <div className="space-y-2">
            <span className="text-xs uppercase font-bold text-[#B76E79] tracking-wider">
              {jobId ? 'Application Submitted' : 'Registration Complete'}
            </span>
            <h2 className="text-2xl font-black text-[#292524]">
              {jobId ? 'You Are All Set!' : 'Welcome Coach!'}
            </h2>
            <p className="text-xs sm:text-sm text-[#57534E] leading-relaxed">
              {successData.message}
            </p>
          </div>

          {jobInfo && (
            <div className="bg-[#FFFFFF] border border-[#E7DADD] rounded-2xl p-4 text-left space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Position:</span>
                <span className="font-bold text-white">{jobInfo.title}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Gym Facility:</span>
                <span className="font-bold text-[#B76E79]">{jobInfo.gymName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Status:</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                  Pending Review
                </span>
              </div>
            </div>
          )}

          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate('/trainer/applications')}
              className="px-6 py-3 bg-gradient-to-r from-[#B76E79] to-[#9F5965] text-[#FFFFFF] font-bold rounded-xl text-xs sm:text-sm hover:scale-[1.02] transition-all shadow-md shadow-[#B76E79]/20 cursor-pointer"
            >
              View My Applications
            </button>
            <button
              onClick={() => navigate('/trainer/jobs')}
              className="px-6 py-3 bg-[#FFFFFF] hover:bg-[#F3E8E8] text-white border border-[#E7DADD] font-semibold rounded-xl text-xs sm:text-sm transition-all cursor-pointer"
            >
              Browse More Jobs
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#292524] flex flex-col items-center justify-center px-4 py-12 relative selection:bg-[#B76E79] selection:text-[#FFFFFF]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(183,110,121,0.06)_0%,_transparent_60%)] pointer-events-none" />

      {/* Top Header Navigation */}
      <div className="w-full max-w-3xl flex items-center justify-between mb-6 z-10">
        <Link
          to={returnUrl ? decodeURIComponent(returnUrl) : (jobId ? `/careers?jobId=${jobId}` : '/careers')}
          className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-[#FFFFFF] bg-[#B76E79] hover:bg-[#9F5965] transition-all shadow-md shadow-[#B76E79]/20 flex items-center gap-1.5"
        >
          <ArrowLeft size={16} />
          <span>Back to Trainers Careers</span>
        </Link>

        <Link to="/" className="flex items-center space-x-2 group">
          <div className="w-9 h-9 bg-gradient-to-br from-[#B76E79] to-[#9F5965] rounded-xl flex items-center justify-center shadow-md shadow-[#B76E79]/20 group-hover:scale-105 transition-transform">
            <Activity className="text-[#FFFFFF]" size={22} strokeWidth={2.5} />
          </div>
          <span className="text-2xl font-black tracking-tight text-[#292524] group-hover:text-[#B76E79] transition-colors">
            Gymora
          </span>
        </Link>
      </div>

      {/* Main Container Card */}
      <div className="w-full max-w-3xl bg-[#F3E8E8] border border-[#E7DADD] rounded-3xl shadow-2xl p-6 sm:p-10 z-10 space-y-7">
        
        {/* 5. JOB APPLICATION DETAILS (Read-only banner if jobId present) */}
        {jobInfo ? (
          <div className="p-5 bg-[#FFFFFF] border border-[#B76E79]/40 rounded-2xl relative overflow-hidden space-y-3 shadow-lg">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#B76E79]/10 text-[#B76E79] flex items-center justify-center shrink-0 border border-[#B76E79]/20">
                  <Briefcase size={22} />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#B76E79] tracking-wider block">
                    Job Application Position
                  </span>
                  <h3 className="text-lg font-bold text-[#292524] leading-tight">
                    {jobInfo.title}
                  </h3>
                  <p className="text-xs text-[#57534E] flex items-center gap-1.5 mt-0.5">
                    <Building2 size={13} className="text-[#B76E79]" />
                    <span className="font-semibold text-white">{jobInfo.gymName}</span>
                    <span>·</span>
                    <MapPin size={13} className="text-slate-500" />
                    <span>{jobInfo.location}</span>
                  </p>
                </div>
              </div>
              <span className="hidden sm:inline-flex px-3 py-1 bg-[#F3E8E8] text-[10px] font-mono text-slate-400 border border-[#E7DADD] rounded-full">
                ID: {jobInfo.id.slice(-6).toUpperCase()}
              </span>
            </div>

            <div className="pt-2.5 border-t border-[#E7DADD]/70 flex flex-wrap items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5 text-[#B76E79]">
                <ShieldCheck size={14} /> Read-only position details verified by Gymora
              </span>
              <span className="text-slate-500">Applications set to: <strong className="text-yellow-400">Pending Review</strong></span>
            </div>
          </div>
        ) : (
          /* General Registration Header */
          <div className="text-center space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#B76E79]/10 border border-[#B76E79]/30 text-[#B76E79] text-xs font-semibold mb-1">
              <UserCheck size={14} />
              <span>Trainer Registration</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#292524] tracking-tight">
              Join as a Certified Trainer
            </h1>
            <p className="text-xs sm:text-sm text-[#57534E] max-w-lg mx-auto">
              Create your coach profile to apply directly for verified gym vacancies and coaching opportunities.
            </p>
          </div>
        )}

        {/* Logged in trainer helper banner */}
        {isLoggedInTrainer && (
          <div className="p-3.5 bg-cyan-950/40 border border-cyan-500/30 rounded-xl text-xs text-cyan-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserCheck size={16} className="text-[#B76E79] shrink-0" />
              <span>
                Logged in as <strong>{user?.firstName} {user?.lastName}</strong> ({user?.email}). Profile details prefilled below.
              </span>
            </div>
            <span className="text-[10px] bg-[#B76E79]/20 text-[#B76E79] px-2 py-0.5 rounded font-bold">
              Active Trainer
            </span>
          </div>
        )}

        {/* Global Error Banner */}
        {error && (
          <div className="p-4 bg-red-950/40 border border-red-500/30 rounded-2xl text-red-400 text-xs flex items-center gap-2.5">
            <AlertCircle size={18} className="shrink-0" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-7">
          
          {/* ========================================================= */}
          {/* 1. PERSONAL INFORMATION */}
          {/* ========================================================= */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#E7DADD] pb-2">
              <span className="text-xs uppercase font-bold text-[#B76E79] tracking-wider flex items-center gap-2">
                <span>1. Personal Information</span>
              </span>
              <span className="text-[11px] text-slate-500">* Required fields</span>
            </div>

            {/* Profile Photo Upload & Preview */}
            <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-[#FFFFFF] border border-[#E7DADD]">
              <div className="relative group">
                <div className="w-20 h-20 rounded-full border-2 border-[#B76E79] overflow-hidden bg-[#F3E8E8] flex items-center justify-center">
                  {form.profilePhoto ? (
                    <img
                      src={`http://localhost:5600${form.profilePhoto}`}
                      alt="Profile preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserCheck size={32} className="text-slate-500" />
                  )}
                </div>
                {uploadingPhoto && (
                  <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center">
                    <Loader2 size={20} className="animate-spin text-[#B76E79]" />
                  </div>
                )}
              </div>

              <div className="space-y-1 text-center sm:text-left flex-1">
                <label className="block text-xs font-bold text-white">
                  Profile Photo <span className="text-slate-500 font-normal">(Optional)</span>
                </label>
                <p className="text-[11px] text-[#57534E]">
                  Upload a professional headshot to enhance your profile visibility to gym owners. JPG, PNG or WEBP (Max 10MB).
                </p>
                <div className="flex items-center gap-2 pt-1 justify-center sm:justify-start">
                  <input
                    type="file"
                    ref={photoInputRef}
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) handleFileUpload(e.target.files[0], 'photo');
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => photoInputRef.current?.click()}
                    disabled={uploadingPhoto}
                    className="px-3 py-1.5 rounded-xl bg-[#F3E8E8] hover:bg-[#F3E8E8] border border-[#E7DADD] text-xs font-semibold text-slate-200 hover:text-white flex items-center gap-1.5 transition-all"
                  >
                    <Camera size={13} className="text-[#B76E79]" />
                    <span>{form.profilePhoto ? 'Change Photo' : 'Upload Photo'}</span>
                  </button>

                  {form.profilePhoto && (
                    <button
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, profilePhoto: '' }))}
                      className="px-2.5 py-1.5 rounded-xl bg-[#F3E8E8] hover:bg-red-950/40 border border-[#E7DADD] text-xs text-slate-400 hover:text-red-400 transition-all"
                      title="Remove Photo"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* First Name & Last Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  First Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John"
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#FFFFFF] border border-[#E7DADD] focus:border-[#B76E79] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
                />
                {fieldErrors.firstName && (
                  <p className="text-red-400 text-[11px] mt-1 flex items-center gap-1">
                    <AlertCircle size={12} /> {fieldErrors.firstName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Last Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Doe"
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#FFFFFF] border border-[#E7DADD] focus:border-[#B76E79] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
                />
                {fieldErrors.lastName && (
                  <p className="text-red-400 text-[11px] mt-1 flex items-center gap-1">
                    <AlertCircle size={12} /> {fieldErrors.lastName}
                  </p>
                )}
              </div>
            </div>

            {/* Email Address & Mobile Number */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-300">
                    Email Address <span className="text-red-400">*</span>
                  </label>
                  {otpVerified && (
                    <span className="text-[10px] font-bold text-[#B76E79] bg-[#B76E79]/15 border border-[#B76E79]/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Check size={11} strokeWidth={3} /> Verified
                    </span>
                  )}
                </div>

                <div className="relative">
                  <input
                    type="email"
                    required
                    disabled={isLoggedInTrainer || otpVerified}
                    placeholder="john@example.com"
                    value={form.email}
                    onChange={(e) => {
                      setForm({ ...form, email: e.target.value });
                      if (otpVerified) setOtpVerified(false);
                      if (otpSent) setOtpSent(false);
                    }}
                    onBlur={() => {
                      // Automatically generate OTP once valid email format is entered
                      if (!isLoggedInTrainer && !otpVerified && !otpSent && /^\S+@\S+\.\S+$/.test(form.email.trim())) {
                        handleSendOtp(form.email);
                      }
                    }}
                    className={`w-full px-4 py-2.5 bg-[#FFFFFF] border ${
                      otpVerified
                        ? 'border-[#B76E79]/60 text-[#B76E79]'
                        : fieldErrors.email
                        ? 'border-red-500/60'
                        : 'border-[#E7DADD] focus:border-[#B76E79]'
                    } rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none disabled:opacity-75 transition-colors pr-24`}
                  />

                  {/* Send OTP / Change Button */}
                  {!isLoggedInTrainer && (
                    <div className="absolute right-1.5 top-1/2 -translate-y-1/2">
                      {otpVerified ? (
                        <button
                          type="button"
                          onClick={() => {
                            setOtpVerified(false);
                            setOtpSent(false);
                            setOtp('');
                          }}
                          className="px-2.5 py-1 text-[11px] font-semibold text-slate-400 hover:text-white bg-[#F3E8E8] border border-[#E7DADD] rounded-lg transition-all"
                        >
                          Change
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={otpSending || !form.email || !/^\S+@\S+\.\S+$/.test(form.email.trim())}
                          onClick={() => handleSendOtp(form.email)}
                          className="px-2.5 py-1 text-[11px] font-bold text-[#FFFFFF] bg-[#B76E79] hover:bg-[#9F5965] disabled:opacity-40 disabled:hover:bg-[#B76E79] rounded-lg transition-all shadow-sm flex items-center gap-1 cursor-pointer"
                        >
                          {otpSending ? (
                            <>
                              <Loader2 size={11} className="animate-spin" />
                              <span>Sending...</span>
                            </>
                          ) : (
                            <span>{otpSent ? 'Resend' : 'Send OTP'}</span>
                          )}
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {fieldErrors.email && (
                  <p className="text-red-400 text-[11px] mt-1 flex items-center gap-1">
                    <AlertCircle size={12} /> {fieldErrors.email}
                  </p>
                )}

                {/* OTP Verification Box */}
                {!isLoggedInTrainer && !otpVerified && otpSent && (
                  <div className="mt-2.5 p-3 rounded-xl bg-[#F3E8E8] border border-[#B76E79]/40 space-y-2.5 shadow-md">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-white">Enter 6-digit OTP code</span>
                      <span className="text-[10px] text-slate-400">Sent to your inbox</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="••••••"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                        className="w-32 px-3 py-1.5 bg-[#FFFFFF] border border-[#E7DADD] focus:border-[#B76E79] rounded-lg text-sm text-center font-mono font-bold text-[#B76E79] tracking-widest focus:outline-none"
                      />
                      <button
                        type="button"
                        disabled={otpVerifying || otp.length < 6}
                        onClick={handleVerifyOtp}
                        className="px-3.5 py-1.5 bg-[#B76E79] hover:bg-[#9F5965] disabled:opacity-40 text-[#FFFFFF] font-bold text-xs rounded-lg transition-all flex items-center gap-1 cursor-pointer shrink-0"
                      >
                        {otpVerifying ? (
                          <>
                            <Loader2 size={12} className="animate-spin" />
                            <span>Verifying...</span>
                          </>
                        ) : (
                          <>
                            <Check size={12} strokeWidth={3} />
                            <span>Verify OTP</span>
                          </>
                        )}
                      </button>

                      {resendTimer > 0 ? (
                        <span className="text-[10px] text-slate-500 ml-auto font-mono">
                          Resend in {resendTimer}s
                        </span>
                      ) : (
                        <button
                          type="button"
                          disabled={otpSending}
                          onClick={() => handleSendOtp(form.email)}
                          className="text-[10px] text-[#B76E79] hover:underline ml-auto"
                        >
                          Resend OTP
                        </button>
                      )}
                    </div>

                    {otpMessage && (
                      <p className="text-[10px] text-[#B76E79] flex items-center gap-1">
                        <CheckCircle2 size={11} /> {otpMessage}
                      </p>
                    )}

                    {otpError && (
                      <p className="text-[10px] text-red-400 flex items-center gap-1">
                        <AlertCircle size={11} /> {otpError}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-300">
                    Mobile Number <span className="text-red-400">*</span>
                  </label>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {form.mobile.length}/10 digits
                  </span>
                </div>

                <div
                  className={`flex rounded-xl overflow-hidden border bg-[#FFFFFF] transition-colors ${
                    fieldErrors.mobile
                      ? 'border-red-500/60'
                      : 'border-[#E7DADD] focus-within:border-[#B76E79]'
                  }`}
                >
                  <span className="inline-flex items-center px-3.5 text-xs font-bold text-[#B76E79] bg-[#F3E8E8] border-r border-[#E7DADD] select-none">
                    +91
                  </span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    required
                    placeholder="98765 43210"
                    value={form.mobile}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setForm({ ...form, mobile: digits });
                      if (digits.length === 10) {
                        setFieldErrors((prev) => {
                          const next = { ...prev };
                          delete next.mobile;
                          return next;
                        });
                      }
                    }}
                    className="w-full px-3.5 py-2.5 bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none tracking-wider font-medium"
                  />
                </div>

                {fieldErrors.mobile ? (
                  <p className="text-red-400 text-[11px] mt-1 flex items-center gap-1">
                    <AlertCircle size={12} /> {fieldErrors.mobile}
                  </p>
                ) : (
                  <p className="text-[10px] text-slate-500 mt-1">
                    Enter valid 10-digit mobile number
                  </p>
                )}
              </div>
            </div>

            {/* Current City / Location */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Current City / Location <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Bangalore, Karnataka"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full px-4 py-2.5 bg-[#FFFFFF] border border-[#E7DADD] focus:border-[#B76E79] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
              />
              {fieldErrors.city && (
                <p className="text-red-400 text-[11px] mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {fieldErrors.city}
                </p>
              )}
            </div>
          </div>

          {/* ========================================================= */}
          {/* 2. PROFESSIONAL QUALIFICATIONS & EXPERTISE */}
          {/* ========================================================= */}
          <div className="space-y-4 pt-3 border-t border-[#E7DADD]">
            <span className="text-xs uppercase font-bold text-[#B76E79] tracking-wider block">
              2. Professional Qualifications & Expertise
            </span>

            {/* Specialization & Years of Experience */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Primary Specialization <span className="text-red-400">*</span>
                </label>
                <select
                  value={form.specialization}
                  onChange={(e) => setForm({ ...form, specialization: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#FFFFFF] border border-[#E7DADD] focus:border-[#B76E79] rounded-xl text-xs text-white focus:outline-none cursor-pointer"
                >
                  {SPECIALIZATIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Years of Experience <span className="text-red-400">*</span>
                </label>
                <select
                  value={form.experience}
                  onChange={(e) => setForm({ ...form, experience: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#FFFFFF] border border-[#E7DADD] focus:border-[#B76E79] rounded-xl text-xs text-white focus:outline-none cursor-pointer"
                >
                  {EXPERIENCE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Preferred Training Mode */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Preferred Training Mode <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {TRAINING_MODES.map((mode) => {
                  const selected = form.trainingMode === mode.value;
                  return (
                    <button
                      key={mode.value}
                      type="button"
                      onClick={() => setForm({ ...form, trainingMode: mode.value })}
                      className={`flex items-center gap-2.5 p-3 rounded-2xl border text-left transition-all ${
                        selected
                          ? 'bg-[#B76E79]/10 border-[#B76E79] shadow-sm shadow-[#B76E79]/20'
                          : 'bg-[#FFFFFF] border-[#E7DADD] hover:border-[#B76E79]/40'
                      }`}
                    >
                      <span className="text-lg">{mode.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className={`text-xs font-bold truncate ${selected ? 'text-[#B76E79]' : 'text-white'}`}>
                          {mode.label}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">{mode.desc}</div>
                      </div>
                      {selected && <Check size={14} className="text-[#B76E79] shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Certifications & Education */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Certifications <span className="text-slate-500 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. ACE CPT, ISSA, CPR/AED, K11"
                  value={form.certifications}
                  onChange={(e) => setForm({ ...form, certifications: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#FFFFFF] border border-[#E7DADD] focus:border-[#B76E79] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Education / Qualifications <span className="text-slate-500 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. B.Sc Exercise Science / Certified Coach"
                  value={form.qualifications}
                  onChange={(e) => setForm({ ...form, qualifications: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#FFFFFF] border border-[#E7DADD] focus:border-[#B76E79] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Previous Gym & Expected Salary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Previous Gym / Employer Name <span className="text-slate-500 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Gold's Gym, Cult.fit, Anytime Fitness"
                  value={form.previousGym}
                  onChange={(e) => setForm({ ...form, previousGym: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#FFFFFF] border border-[#E7DADD] focus:border-[#B76E79] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Expected Salary (INR) <span className="text-slate-500 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. 35,000 / Monthly"
                  value={form.expectedSalary}
                  onChange={(e) => setForm({ ...form, expectedSalary: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#FFFFFF] border border-[#E7DADD] focus:border-[#B76E79] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Availability to Join & Preferred Work Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Availability to Join <span className="text-red-400">*</span>
                </label>
                <select
                  value={form.availability}
                  onChange={(e) => setForm({ ...form, availability: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#FFFFFF] border border-[#E7DADD] focus:border-[#B76E79] rounded-xl text-xs text-white focus:outline-none cursor-pointer"
                >
                  {AVAILABILITY_OPTIONS.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Preferred Work Location <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Indiranagar, Bangalore / Tirupattur"
                  value={form.preferredLocation}
                  onChange={(e) => setForm({ ...form, preferredLocation: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#FFFFFF] border border-[#E7DADD] focus:border-[#B76E79] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
                />
                {fieldErrors.preferredLocation && (
                  <p className="text-red-400 text-[11px] mt-1 flex items-center gap-1">
                    <AlertCircle size={12} /> {fieldErrors.preferredLocation}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* 3. RESUME & DOCUMENTS */}
          {/* ========================================================= */}
          <div className="space-y-4 pt-3 border-t border-[#E7DADD]">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold text-[#B76E79] tracking-wider block">
                3. Resume & Documents
              </span>
              <span className="text-[11px] text-slate-400">PDF, DOC, DOCX up to 10MB</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Document 1: Resume / CV */}
              <div
                className={`p-4 rounded-2xl bg-[#FFFFFF] border transition-all ${
                  fieldErrors.resumeUrl
                    ? 'border-red-500/50'
                    : form.resumeUrl
                    ? 'border-[#B76E79]/50'
                    : 'border-[#E7DADD]'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#B76E79]/10 text-[#B76E79] flex items-center justify-center">
                      <FileText size={16} />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">
                        Upload Resume / CV <span className="text-red-400">*</span>
                      </span>
                      <span className="text-[10px] text-slate-400">PDF, DOC, DOCX</span>
                    </div>
                  </div>

                  {form.resumeUrl && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#B76E79]/15 text-[#B76E79] border border-[#B76E79]/30 flex items-center gap-1">
                      <Check size={10} strokeWidth={3} /> Uploaded
                    </span>
                  )}
                </div>

                <input
                  type="file"
                  ref={resumeInputRef}
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) handleFileUpload(e.target.files[0], 'resume');
                  }}
                />

                {form.resumeUrl ? (
                  <div className="mt-3 p-2.5 rounded-xl bg-[#F3E8E8] border border-[#E7DADD] flex items-center justify-between text-xs">
                    <div className="truncate flex-1 pr-2">
                      <p className="font-semibold text-white truncate">{form.resumeOriginalName || 'Resume.pdf'}</p>
                      {resumeSizeText && <p className="text-[10px] text-slate-500">{resumeSizeText}</p>}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => resumeInputRef.current?.click()}
                        disabled={uploadingResume}
                        className="p-1.5 rounded-lg bg-[#FFFFFF] hover:bg-[#F3E8E8] text-slate-300 hover:text-white"
                        title="Replace Resume"
                      >
                        <RefreshCw size={13} className={uploadingResume ? 'animate-spin' : ''} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, resumeUrl: '', resumeOriginalName: '' }))}
                        className="p-1.5 rounded-lg bg-[#FFFFFF] hover:bg-red-950/40 text-slate-400 hover:text-red-400"
                        title="Remove Resume"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => resumeInputRef.current?.click()}
                    disabled={uploadingResume}
                    className="w-full mt-3 py-3 px-4 border border-dashed border-[#E7DADD] hover:border-[#B76E79] rounded-xl bg-[#F3E8E8] text-xs font-semibold text-slate-300 hover:text-white flex items-center justify-center gap-2 transition-all cursor-pointer group"
                  >
                    {uploadingResume ? (
                      <>
                        <Loader2 size={14} className="animate-spin text-[#B76E79]" />
                        <span>Uploading Resume...</span>
                      </>
                    ) : (
                      <>
                        <Upload size={14} className="text-[#B76E79] group-hover:scale-110 transition-transform" />
                        <span>Choose Resume File</span>
                      </>
                    )}
                  </button>
                )}

                {fieldErrors.resumeUrl && (
                  <p className="text-red-400 text-[11px] mt-2 flex items-center gap-1">
                    <AlertCircle size={12} /> {fieldErrors.resumeUrl}
                  </p>
                )}
              </div>

              {/* Document 2: Fitness Certifications */}
              <div
                className={`p-4 rounded-2xl bg-[#FFFFFF] border transition-all ${
                  form.certificationUrl ? 'border-[#B76E79]/50' : 'border-[#E7DADD]'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#B76E79]/10 text-[#B76E79] flex items-center justify-center">
                      <Award size={16} />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">
                        Fitness Certifications <span className="text-slate-500 font-normal">(Optional)</span>
                      </span>
                      <span className="text-[10px] text-slate-400">PDF, JPG, PNG</span>
                    </div>
                  </div>

                  {form.certificationUrl && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#B76E79]/15 text-[#B76E79] border border-[#B76E79]/30 flex items-center gap-1">
                      <Check size={10} strokeWidth={3} /> Uploaded
                    </span>
                  )}
                </div>

                <input
                  type="file"
                  ref={certInputRef}
                  accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) handleFileUpload(e.target.files[0], 'cert');
                  }}
                />

                {form.certificationUrl ? (
                  <div className="mt-3 p-2.5 rounded-xl bg-[#F3E8E8] border border-[#E7DADD] flex items-center justify-between text-xs">
                    <div className="truncate flex-1 pr-2">
                      <p className="font-semibold text-white truncate">{form.certificationOriginalName || 'Certification.pdf'}</p>
                      {certSizeText && <p className="text-[10px] text-slate-500">{certSizeText}</p>}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => certInputRef.current?.click()}
                        disabled={uploadingCert}
                        className="p-1.5 rounded-lg bg-[#FFFFFF] hover:bg-[#F3E8E8] text-slate-300 hover:text-white"
                        title="Replace Document"
                      >
                        <RefreshCw size={13} className={uploadingCert ? 'animate-spin' : ''} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, certificationUrl: '', certificationOriginalName: '' }))}
                        className="p-1.5 rounded-lg bg-[#FFFFFF] hover:bg-red-950/40 text-slate-400 hover:text-red-400"
                        title="Remove Document"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => certInputRef.current?.click()}
                    disabled={uploadingCert}
                    className="w-full mt-3 py-3 px-4 border border-dashed border-[#E7DADD] hover:border-[#B76E79] rounded-xl bg-[#F3E8E8] text-xs font-semibold text-slate-300 hover:text-white flex items-center justify-center gap-2 transition-all cursor-pointer group"
                  >
                    {uploadingCert ? (
                      <>
                        <Loader2 size={14} className="animate-spin text-[#B76E79]" />
                        <span>Uploading Document...</span>
                      </>
                    ) : (
                      <>
                        <Upload size={14} className="text-[#B76E79] group-hover:scale-110 transition-transform" />
                        <span>Upload Certifications</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* 4. ACCOUNT SECURITY (Only shown when not logged in) */}
          {/* ========================================================= */}
          {!isLoggedInTrainer && (
            <div className="space-y-4 pt-3 border-t border-[#E7DADD]">
              <span className="text-xs uppercase font-bold text-[#B76E79] tracking-wider block">
                4. Account Security
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Password <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Minimum 8 characters"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className="w-full px-4 py-2.5 bg-[#FFFFFF] border border-[#E7DADD] focus:border-[#B76E79] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none pr-10 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {fieldErrors.password && (
                    <p className="text-red-400 text-[11px] mt-1 flex items-center gap-1">
                      <AlertCircle size={12} /> {fieldErrors.password}
                    </p>
                  )}

                  {/* Password strength visual indicator */}
                  {form.password && (
                    <div className="mt-2 space-y-1">
                      <div className="h-1.5 w-full bg-[#FFFFFF] rounded-full overflow-hidden flex gap-1">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${pwdStrength.color}`}
                          style={{ width: `${pwdStrength.score}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-500">
                        <span>Strength: <strong className="text-white">{pwdStrength.label}</strong></span>
                        <span>Use letters, numbers &amp; symbols</span>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Confirm Password <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      placeholder="Repeat password"
                      value={form.confirmPassword}
                      onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                      className="w-full px-4 py-2.5 bg-[#FFFFFF] border border-[#E7DADD] focus:border-[#B76E79] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none pr-10 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {fieldErrors.confirmPassword && (
                    <p className="text-red-400 text-[11px] mt-1 flex items-center gap-1">
                      <AlertCircle size={12} /> {fieldErrors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>

              {/* Consent Checkbox */}
              <div className="pt-2">
                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={form.acceptTerms}
                    onChange={(e) => setForm({ ...form, acceptTerms: e.target.checked })}
                    className="mt-0.5 rounded border-[#E7DADD] text-[#B76E79] focus:ring-0 cursor-pointer"
                  />
                  <span className="text-xs text-slate-400 leading-relaxed">
                    I agree to the Gymora{' '}
                    <Link to="/terms-of-service" className="text-[#B76E79] hover:underline" target="_blank">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy-policy" className="text-[#B76E79] hover:underline" target="_blank">
                      Privacy Policy
                    </Link>
                    .
                  </span>
                </label>
                {fieldErrors.acceptTerms && (
                  <p className="text-red-400 text-[11px] mt-1 flex items-center gap-1">
                    <AlertCircle size={12} /> {fieldErrors.acceptTerms}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* SUBMIT BUTTON */}
          {/* ========================================================= */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading || uploadingResume || uploadingCert}
              className="w-full py-4 bg-gradient-to-r from-[#B76E79] to-[#9F5965] text-[#FFFFFF] font-extrabold rounded-2xl hover:from-[#9F5965] hover:to-[#9F5965] transition-all disabled:opacity-60 flex items-center justify-center space-x-2 shadow-xl shadow-[#B76E79]/20 cursor-pointer text-sm sm:text-base"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>{jobId ? 'Submitting Application...' : 'Creating Account...'}</span>
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  <span>
                    {isLoggedInTrainer && jobId
                      ? 'Submit Job Application'
                      : jobId
                      ? 'Register & Apply for Position'
                      : 'Register as Trainer'}
                  </span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Existing account footer link */}
        {!isLoggedInTrainer && (
          <div className="pt-4 border-t border-[#E7DADD] text-center text-xs text-slate-400">
            Already have a Trainer account?{' '}
            <Link
              to={jobId ? `/login?portal=trainer&redirect=${encodeURIComponent(`/register/trainer?jobId=${jobId}`)}` : '/login?portal=trainer'}
              className="text-[#B76E79] font-semibold hover:underline"
            >
              Log In here
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
