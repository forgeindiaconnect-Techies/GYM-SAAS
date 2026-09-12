import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, ChevronRight, ChevronLeft, Save, Loader2 } from 'lucide-react';
import {
  Step1GymInfo,
  Step2OwnerInfo,
  Step3Location,
  Step4AdminAccount,
  Step5AdditionalDetails,
  Step6Specialties,
  Step7Trainers,
  Step8Plans,
  Step9Members,
  Step10Review
} from '../../components/GymOnboarding';
import { addItem } from '../../utils/mockDb';

const STEPS = [
  { id: 1, title: 'Gym Info' },
  { id: 2, title: 'Owner' },
  { id: 3, title: 'Location' },
  { id: 4, title: 'Admin' },
  { id: 5, title: 'Details' },
  { id: 6, title: 'Specialties' },
  { id: 7, title: 'Trainers' },
  { id: 8, title: 'Plans' },
  { id: 9, title: 'Members' },
  { id: 10, title: 'Review' }
];

const INITIAL_DATA = {
  // Step 1
  gymName: '', gymType: '', trainingMode: '', services: [],
  // Step 2
  ownerName: '', ownerEmail: '', ownerPhone: '', ownerAltPhone: '', ownerDob: '', ownerGender: '', ownerAddress: '',
  // Step 3
  address: '', city: '', state: '', country: '', pincode: '', maxCapacity: '', totalArea: '', floors: '',
  // Step 4
  adminName: '', adminEmail: '', adminPassword: '', adminConfirmPassword: '',
  // Step 5
  description: '', establishedYear: '', openingTime: '', closingTime: '', workingDays: [],
  facilities: { parking: false, locker: false, shower: false, wifi: false, ac: false, water: false, cctv: false, changingRoom: false, pt: false },
  // Step 6
  specialties: [],
  // Step 7
  trainers: [],
  // Step 8
  plans: [],
  // Step 9
  members: []
};

const SuperAdminGymsAdd = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<any>(INITIAL_DATA);
  const [errors, setErrors] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDraftLoading, setIsDraftLoading] = useState(true);

  // Load draft
  useEffect(() => {
    const draft = localStorage.getItem('gym_setup_draft');
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        if (window.confirm('A saved draft was found. Do you want to resume?')) {
          setFormData(parsed.data);
          setCurrentStep(parsed.step || 1);
        } else {
          localStorage.removeItem('gym_setup_draft');
        }
      } catch (e) {}
    }
    setIsDraftLoading(false);
  }, []);

  // Save draft on change
  useEffect(() => {
    if (!isDraftLoading) {
      localStorage.setItem('gym_setup_draft', JSON.stringify({ data: formData, step: currentStep }));
    }
  }, [formData, currentStep, isDraftLoading]);

  const updateData = (fields: any) => {
    setFormData(prev => ({ ...prev, ...fields }));
    // Clear errors for updated fields
    const newErrors = { ...errors };
    Object.keys(fields).forEach(key => delete newErrors[key]);
    setErrors(newErrors);
  };

  const validateStep = (step: number) => {
    const newErrors: any = {};
    let isValid = true;

    if (step === 1) {
      if (!formData.gymName) newErrors.gymName = 'Gym name is required';
      if (!formData.gymType) newErrors.gymType = 'Gym type is required';
      if (!formData.trainingMode) newErrors.trainingMode = 'Training mode is required';
      if (!formData.services || formData.services.length === 0) newErrors.services = 'Please select at least one service';
      else {
        if ((formData.trainingMode === 'online' || formData.trainingMode === 'both') && !formData.services.includes('Online Training')) {
          newErrors.services = 'Online Training service must be selected for Online or Both modes';
        }
        if ((formData.trainingMode === 'offline' || formData.trainingMode === 'both') && !formData.services.includes('Offline Training')) {
          newErrors.services = 'Offline Training service must be selected for Offline or Both modes';
        }
      }
    } else if (step === 2) {
      if (!formData.ownerName) newErrors.ownerName = 'Owner name is required';
      if (!formData.ownerEmail) newErrors.ownerEmail = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.ownerEmail)) newErrors.ownerEmail = 'Invalid email format';
      
      if (!formData.ownerPhone) newErrors.ownerPhone = 'Phone is required';
      else if (!/^\d{10}$/.test(formData.ownerPhone)) newErrors.ownerPhone = 'Phone must be exactly 10 digits';

      if (formData.ownerAltPhone && !/^\d{10}$/.test(formData.ownerAltPhone)) newErrors.ownerAltPhone = 'Phone must be exactly 10 digits';
    } else if (step === 3) {
      if (!formData.city) newErrors.city = 'City is required';
      if (!formData.state) newErrors.state = 'State is required';
    } else if (step === 4) {
      if (!formData.adminName) newErrors.adminName = 'Admin name is required';
      if (!formData.adminEmail) newErrors.adminEmail = 'Admin email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.adminEmail)) newErrors.adminEmail = 'Invalid email format';
      if (!formData.adminPassword) newErrors.adminPassword = 'Password is required';
      if (formData.adminPassword !== formData.adminConfirmPassword) newErrors.adminConfirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      isValid = false;
      // Show toast error ideally
    }
    return isValid;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      window.scrollTo(0, 0);
      setCurrentStep(prev => Math.min(prev + 1, 10));
    }
  };

  const prevStep = () => {
    window.scrollTo(0, 0);
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const submitGym = async () => {
    if (!validateStep(10)) return; // Final validation
    
    setIsSubmitting(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      const gymId = Date.now().toString();

      // 1. Save Gym
      addItem('gyms', {
        id: gymId,
        gymName: formData.gymName,
        type: formData.gymType,
        description: formData.description,
        establishedYear: formData.establishedYear,
        openingTime: formData.openingTime,
        closingTime: formData.closingTime,
        maxCapacity: formData.maxCapacity,
        totalArea: formData.totalArea,
        status: 'Active',
        onboardedDate: new Date().toISOString().split('T')[0],
        owner: formData.ownerName,
        location: formData.city + ', ' + formData.state,
        trainersCount: formData.trainers.length,
        membersCapacity: formData.maxCapacity || 0,
        admin: formData.adminName,
        facilities: formData.facilities,
        specialties: formData.specialties
      });

      // 2. Save Admin
      addItem('gymAdmins', {
        gymId,
        name: formData.adminName,
        email: formData.adminEmail,
        password: formData.adminPassword, // In real app, hash this
        role: 'GYM_ADMIN'
      });

      // 3. Save Trainers
      formData.trainers.forEach((t: any) => {
        addItem('trainers', { ...t, gymId, status: 'Active' });
      });

      // 4. Save Plans
      formData.plans.forEach((p: any) => {
        addItem('subscriptionPlans', { ...p, gymId, status: 'Active' });
      });

      // 5. Save Members
      formData.members.forEach((m: any) => {
        addItem('members', { ...m, gymId, status: 'Active' });
      });

      // Clear draft
      localStorage.removeItem('gym_setup_draft');
      
      alert('Congratulations! Your gym has been successfully created.');
      navigate('/super-admin/gyms/all');
    } catch (err) {
      console.error(err);
      alert('Failed to create gym. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isDraftLoading) return null;

  const renderStep = () => {
    const props = { data: formData, updateData, errors };
    switch (currentStep) {
      case 1: return <Step1GymInfo {...props} />;
      case 2: return <Step2OwnerInfo {...props} />;
      case 3: return <Step3Location {...props} />;
      case 4: return <Step4AdminAccount {...props} />;
      case 5: return <Step5AdditionalDetails {...props} />;
      case 6: return <Step6Specialties {...props} />;
      case 7: return <Step7Trainers {...props} />;
      case 8: return <Step8Plans {...props} />;
      case 9: return <Step9Members {...props} />;
      case 10: return <Step10Review {...props} setStep={setCurrentStep} />;
      default: return null;
    }
  };

  const progressPercentage = ((currentStep - 1) / 9) * 100;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/super-admin/gyms/all" className="p-2 bg-[#FFFFFF] hover:bg-[#E2E8F0] rounded-xl transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Gym Setup Wizard</h1>
            <p className="text-[#475569] text-sm">Step {currentStep} of 10</p>
          </div>
        </div>
        <button onClick={() => alert('Draft Saved!')} className="flex items-center space-x-2 px-4 py-2 bg-[#FFFFFF] hover:bg-[#E2E8F0] rounded-xl transition-colors text-sm font-medium text-[#475569]">
          <Save size={16} />
          <span>Save Draft</span>
        </button>
      </div>

      {/* Progress Bar */}
      <div className="bg-[#FFFFFF] border border-[#CCFBF1] rounded-2xl p-6">
        <div className="relative pt-1">
          <div className="flex mb-2 items-center justify-between">
            <div>
              <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-[#16A34A] bg-[#16A34A]/10">
                Setup Progress
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold inline-block text-[#16A34A]">
                {Math.round(progressPercentage)}%
              </span>
            </div>
          </div>
          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-[#FFFFFF]">
            <div style={{ width: `${progressPercentage}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-[#1E293B] justify-center bg-[#16A34A] transition-all duration-500"></div>
          </div>
        </div>
        
        {/* Step Indicators */}
        <div className="hidden md:flex justify-between mt-4">
          {STEPS.map((step) => (
            <div 
              key={step.id} 
              className={`flex flex-col items-center cursor-pointer ${currentStep === step.id ? 'text-[#16A34A]' : step.id < currentStep ? 'text-green-500' : 'text-[#475569]'}`}
              onClick={() => step.id < currentStep && setCurrentStep(step.id)}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 mb-2 transition-colors
                ${currentStep === step.id ? 'border-[#16A34A] bg-[#16A34A]/10' : 
                  step.id < currentStep ? 'border-green-500 bg-green-500/10' : 'border-[#CCFBF1] bg-[#FFFFFF]'}`}
              >
                {step.id < currentStep ? <CheckCircle2 size={16} /> : step.id}
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider">{step.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-[#FFFFFF] border border-[#CCFBF1] rounded-2xl p-6 md:p-8 min-h-[400px]">
        {renderStep()}
      </div>

      {/* Navigation Footer */}
      <div className="flex justify-between items-center bg-[#FFFFFF] border border-[#CCFBF1] rounded-2xl p-4">
        <button
          onClick={prevStep}
          disabled={currentStep === 1}
          className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-bold transition-all ${currentStep === 1 ? 'opacity-50 cursor-not-allowed bg-[#FFFFFF] text-[#475569]' : 'bg-[#FFFFFF] text-[#1E293B] hover:bg-[#E2E8F0]'}`}
        >
          <ChevronLeft size={18} />
          <span>Previous</span>
        </button>

        {currentStep < 10 ? (
          <button
            onClick={nextStep}
            className="flex items-center space-x-2 px-6 py-3 bg-[#16A34A] text-white rounded-xl font-bold hover:bg-[#15803D] transition-all shadow-lg shadow-[#16A34A]/20"
          >
            <span>Next Step</span>
            <ChevronRight size={18} />
          </button>
        ) : (
          <button
            onClick={submitGym}
            disabled={isSubmitting}
            className="flex items-center space-x-2 px-8 py-3 bg-green-500 text-black rounded-xl font-bold hover:bg-green-600 transition-all shadow-lg shadow-green-500/20"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
            <span>{isSubmitting ? 'Creating Gym...' : 'Confirm & Create Gym'}</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default SuperAdminGymsAdd;
